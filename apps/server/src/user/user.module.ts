import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserControllerHttp } from './controllers/http/user.controller.http';
import { User, UserSchema } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CaslAbilityFactory } from 'src/role/permissions.factory';
import { InstructorControllerHttp } from './controllers/http/instructor.controller.http';
import { RoleModule } from 'src/role/role.module';
import { UserControllerMessage } from './controllers/message/user.controller.message';
import { WalletModule } from 'src/wallet/wallet.module';
import { InstructorService } from './services/instructor.service';
import { InstructorControllerMessage } from './controllers/message/instructor.controller.message';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    RoleModule,

    forwardRef(() => WalletModule),

  ],
  controllers: [
    UserControllerHttp,
    UserControllerMessage,
    InstructorControllerHttp,
    InstructorControllerMessage,
  ],
  providers: [UserService, InstructorService],
  exports: [UserService, InstructorService],
})
export class UserModule { }
