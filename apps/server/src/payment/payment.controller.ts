import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Redirect, NotFoundException } from '@nestjs/common';
import { PaymobService } from './payment.paymob.service';
import { PaypalPaymentService } from './payment.paypal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InitiateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { restore } from 'src/utils/encrypt';
import { CreateWalletCreditUrlDto } from './dto/create-wallet-credit-url';
import { PaymentWalletService } from './payment.wallet.service';
import { PaymobPaymentLinWebHookBody } from './types/PaymobPaymentLink.interface';
import { WalletService } from 'src/wallet/wallet.service';
import { Connection } from 'mongoose';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { start } from 'repl';
import { InjectConnection } from '@nestjs/mongoose';
// import { CreateSubscriptionDto } from 'src/subscription/dto/create-subscription.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly PaymobService: PaymobService,
    private readonly paypalPaymentService: PaypalPaymentService,
    private readonly paymentWalletService: PaymentWalletService,
    private readonly walletService: WalletService,
    @InjectConnection() private readonly connection: Connection,
    private readonly enrollmentService: EnrollmentService

  ) {
  }


  @Post("/paymob/subscription/initiate")
  async initiate(@Body() initiateSubscriptionDto: InitiateSubscriptionDto) {
    return await this.PaymobService.getPaymentUrl(initiateSubscriptionDto);
  }


  @Post("/paymob/subscription/webhook")
  async webhookController(@Body() webhookBody: any) {
    return await this.PaymobService.webhookSubscription(webhookBody)
  }





  @UseGuards(AuthGuard)
  @Post("paypal/subscription/initiate")
  async initiatePaypal(@Body() initiateSubscriptionDto: InitiateSubscriptionDto, @Req() req: IUserRequest) {
    return await this.paypalPaymentService.getPaymentUrl(initiateSubscriptionDto, req.user);
  }



  @Post("paybal/webhook")
  async paypalWebhook(@Body() webhookBody: any) {
    return await this.paypalPaymentService.webhookSubscription(webhookBody);
  }

  @Get("paybal/return_url")
  @Redirect("payment/paybal/success", 302)
  async paypalReturnUrl(@Req() req: IUserRequest) {
    console.log("paypal return url", req.query);
    const { token, subscription_id } = req.query;



    return { message: "return_url successful" };
  }

  @Get("paybal/success")
  async paypalSuccess(@Req() req: IUserRequest) {
    console.log("paypal success", req.query);
    return { message: "Subscription successful" };
  }



  @UseGuards(AuthGuard)
  @Post("wallet/paymob/credit-card-url")
  async createWalletCreditPaymobUrl(@Body() createWalletCreditUrlDto: CreateWalletCreditUrlDto, @Req() req: IUserRequest) {
    return await this.paymentWalletService.createPaymobPaymentLink(createWalletCreditUrlDto, req.user)
  }

  @UseGuards(AuthGuard)
  @Post("wallet/paymob/wallet-url")
  async createWalletCreditWalletPaymobUrl(@Body() createWalletCreditUrlDto: CreateWalletCreditUrlDto, @Req() req: IUserRequest) {
    return await this.paymentWalletService.createPaymobPaymentLink(createWalletCreditUrlDto, req.user, {
      payment_methods: process.env.WALLET_INTEGRATION as string,
    })
  }


  @Post("/wallet/paymob/credit-url/webhook")
  async webhookPaymentController(@Body() webhookBody: PaymobPaymentLinWebHookBody) {
    try {
      console.dir({ webhookBody }, { depth: null });
      const foundedWallet = await this.walletService.findByUserIdentifier(webhookBody.obj.payment_key_claims.billing_data.email);
      console.log({ foundedWallet });
      if (!foundedWallet) throw new NotFoundException("User Wallet Not Found");
      const creditedWallet = await this.walletService.credit({ transactionDto: { amount: Number(webhookBody.obj.amount_cents) / 100, currency: webhookBody.obj.payment_key_claims.currency }, id: foundedWallet._id as string });
      console.log({ creditedWallet });
      return { message: "Wallet credited successfully", wallet: creditedWallet }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Post("wallet/subscription/create")
  async creditWalletSubscription(@Body() initiateSubscriptionDto: InitiateSubscriptionDto, @Req() req: IUserRequest) {
    return await this.paymentWalletService.subscribeWithWallet(initiateSubscriptionDto, req.user);


  }

}
