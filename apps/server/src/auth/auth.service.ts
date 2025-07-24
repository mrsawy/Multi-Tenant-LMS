import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { OrganizationService } from 'src/organization/organization.service';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';


const saltRounds = 10;

@Injectable()
export class AuthService {

  private readonly secret = process.env.JSON_PRIVATE_KEY || "";
  private readonly expiresIn = '24h';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
  ) { }


  async register(registerDto: RegisterDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { userDto, organizationDto } = registerDto;

      // 1. Create organization inside transaction
      const { organization } = await this.organizationService.create(organizationDto, session);

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

      // 3. Create user inside transaction
      const { user } = await this.userService.create(
        {
          ...userDto,
          password: hashedPassword,
          organization: organization._id,
          role: 'ADMIN',
        },
        session,
      );

      // 4. Generate JWT
      const payload = {
        userName: user.username,
        email: user.email,
        role: user.role,
        organization,
      };

      const token = this.generateToken(payload);

      // 5. Commit transaction
      await session.commitTransaction();
      session.endSession();

      return {
        access_token: token,
        user: payload,
      };
    } catch (error) {
      // Rollback if anything fails
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
      const payload = { userName: foundedUser.username, email: foundedUser.email, role: foundedUser.role, organization: foundedUser.organization }

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
    console.log({ payload })
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }


}
