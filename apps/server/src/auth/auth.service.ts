import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { OrganizationService } from 'src/organization/organization.service';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { WalletService } from 'src/wallet/wallet.service';
import { RoleService } from 'src/role/role.service';
import { PlanService } from 'src/plan/plan.service';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';


@Injectable()
export class AuthService {

  private readonly secret = process.env.JSON_PRIVATE_KEY || "";
  private readonly expiresIn = '3d';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly roleService: RoleService,
    private readonly planService: PlanService
  ) { }


  async register(registerDto: RegisterDto) {
    const session = await this.connection.startSession();
    session.startTransaction();


    try {
      const { userDto, organizationDto } = registerDto;

      const userId = new mongoose.Types.ObjectId()
      const organizationId = new mongoose.Types.ObjectId()
      const walletId = new mongoose.Types.ObjectId()

      const foundedRole = await this.roleService.findOne('ADMIN');
      if (!foundedRole) throw new InternalServerErrorException("Admin Role Not Found. Please create it first.")

      const freePlan = await this.planService.findOne("FREE")
      if (!freePlan) throw new InternalServerErrorException("Free Plan Not Found. Please create it first.")

      const user = await this.userService.create(
        {
          ...userDto,
          _id: userId,
          organizationId: organizationId,
          role: foundedRole.name,
          walletId
        },
        session,
      );

      const { organization } = await this.organizationService.create({
        ...organizationDto, superAdminId: userId, _id: organizationId,
        planName: freePlan.name,
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          starts_at: (new Date()).toISOString(),
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
          billing: {
            amount: 0,
            billingCycle: BillingCycle.ONE_TIME,
            currency: user.preferredCurrency,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone_number: user.phone,
          }
        }
      }, session);


      await this.walletService.create({ _id: walletId, userId: user._id, organizationId: organization._id })


      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      };

      const token = this.generateToken(payload);

      await session.commitTransaction();
      session.endSession();

      return {
        access_token: token,
        user: payload,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {

      const { identifier, password } = loginDto;
      const foundedUser = await this.userService.findOne(identifier)
      if (!foundedUser) {
        throw new Error("Couldn't find user")
      }
      const isMatch = await bcrypt.compare(password, foundedUser?.password);
      if (!isMatch) {
        throw new Error("Wrong Password")
      }
      const payload = { _id: foundedUser._id as string, username: foundedUser.username, email: foundedUser.email, role: foundedUser.role, organizationId: foundedUser.organizationId }

      const token = this.generateToken(payload);

      return {
        access_token: token,
        user: payload
      }

    } catch (error) {
      console.error({ error })
      throw new UnauthorizedException("! Error ! :", error.message)
    }

  }


  generateToken(payload: any): string {
    // console.log({ payload })
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret); // returns decoded payload
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }


}
