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
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentModule } from './plan/enrollment/enrollment.module';
import { PlanModule } from './plan/plan.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EnrollmentModule } from './enrollment/enrollment.module';

configDotenv();

// console.log('MongoDB URI:', process.env);

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
    ConfigModule.forRoot({
      isGlobal: true, // ✅ makes config available app-wide
      envFilePath: '.env',
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
    AuthModule,
    FileModule,
    EnrollmentModule,
    PlanModule,
    SubscriptionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
