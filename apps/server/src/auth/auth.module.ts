import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller.http';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationModule } from 'src/organization/organization.module';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { RoleModule } from 'src/role/role.module';
import { PlanModule } from 'src/plan/plan.module';
import { AuthControllerMessage } from './auth.controller.message';


export const JWT_SECRET = 'VERY_hard!to-guess_secret'

@Module({
  imports: [
    JwtModule.register({ secret: JWT_SECRET }),
    OrganizationModule,
    forwardRef(() => UserModule),
    RoleModule,
    WalletModule,
    PlanModule
  ],
  controllers: [AuthController , AuthControllerMessage],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule { }
