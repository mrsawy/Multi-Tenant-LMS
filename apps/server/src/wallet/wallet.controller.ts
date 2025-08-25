// src/wallet/wallet.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return await this.walletService.findAll(page, limit);
  }

  @Get('stats/total-balance')
  async getTotalBalance() {
    return await this.walletService.getTotalBalance();
  }

  @Get('status/:status')
  async getWalletsByStatus(@Param('status') status: string) {
    let isActive: boolean;
    let isFrozen: boolean | undefined;

    switch (status) {
      case 'active':
        isActive = true;
        isFrozen = false;
        break;
      case 'inactive':
        isActive = false;
        break;
      case 'frozen':
        isActive = true;
        isFrozen = true;
        break;
      default:
        isActive = true;
    }

    return await this.walletService.getWalletsByStatus(isActive, isFrozen);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return await this.walletService.findByUserId(userId);
  }

  @Get('address/:walletAddress')
  async findByWalletAddress(@Param('walletAddress') walletAddress: string) {
    return await this.walletService.findByWalletAddress(walletAddress);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.walletService.findOne(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return await this.walletService.getBalance(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return await this.walletService.update(id, updateWalletDto);
  }

  @Post(':id/credit')
  async credit(@Param('id') id: string, @Body() transactionDto: WalletTransactionDto) {
    return await this.walletService.credit({ id, transactionDto });
  }

  // @Post(':id/debit')
  // async debit(@Param('id') id: string, @Body() transactionDto: WalletTransactionDto) {
  //   return await this.walletService.debit(id, transactionDto);
  // }

  @Patch(':id/freeze')
  async freezeWallet(@Param('id') id: string) {
    return await this.walletService.freezeWallet(id);
  }

  @Patch(':id/unfreeze')
  async unfreezeWallet(@Param('id') id: string) {
    return await this.walletService.unfreezeWallet(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.walletService.remove(id);
  }
}