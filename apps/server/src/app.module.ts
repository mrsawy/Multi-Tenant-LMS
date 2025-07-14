import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configDotenv } from 'dotenv';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { CategoryModule } from './category/category.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
configDotenv();

console.log('MongoDB URI:', process.env.MONGODB_URI_DEV);

@Module({
  imports: [
    // MongooseModule.forRootAsync({
    //   async useFactory() {
    //     const uri = process.env.NODE_ENV === 'DEVELOPMENT' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;


    //     return { uri };
    //   },
    // }),
    // MongooseModule.forRoot(process.env.MONGODB_URI_DEV as string),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URI_DEV,
      }),
    }),
    // RedisModule.forRoot({
    //   config: {
    //     url: process.env.NODE_ENV === 'DEVELOPMENT' ? process.env.REDIS_URL_DEV : process.env.REDIS_URL_PROD,
    //   },
    // }),
    OrganizationModule,
    UserModule,
    CourseModule,
    CategoryModule,
    RoleModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
