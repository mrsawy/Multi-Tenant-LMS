import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserControllerHttp } from './user.controller.http';
import { User, UserSchema } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CaslAbilityFactory } from 'src/role/permissions.factory';
import { RoleModule } from 'src/role/role.module';
import { UserControllerMessage } from './user.controller.message';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    RoleModule
  ],
  controllers: [UserControllerHttp , UserControllerMessage],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
