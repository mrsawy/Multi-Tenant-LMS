import { Module } from '@nestjs/common';
import { configDotenv } from 'dotenv';
configDotenv();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { CategoryModule } from './category/category.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { PlanModule } from './plan/plan.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { PaymentModule } from './payment/payment.module';
import { WalletModule } from './wallet/wallet.module';
import { OptionsModule } from './options/options.module';
import { CurrencyModule } from './currency/currency.module';
import { ReviewModule } from './review/review.module';
import { TransactionModule } from './transaction/transaction.module';
import { PageModule } from './page/page.module';
import { GalleryModule } from './gallery/gallery.module';

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
      useFactory: () => ({
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

    WalletModule,
    OrganizationModule,
    UserModule,
    CourseModule,
    CategoryModule,
    RoleModule,
    AuthModule,
    FileModule,
    EnrollmentModule,
    PlanModule,
    // SubscriptionModule,
    // PaymentModule,
    OptionsModule,
    CurrencyModule,
    ReviewModule,
    TransactionModule,
    PageModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
