import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationModule } from 'src/organization/organization.module';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';


export const JWT_SECRET = 'VERY_hard!to-guess_secret'

@Module({
  imports: [
    JwtModule.register({ secret: JWT_SECRET }),
    OrganizationModule,
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
