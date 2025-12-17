// src/wallet/wallet.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PaginateModel, Types } from 'mongoose';
import { Wallet } from './entities/wallet.entity';
import { randomBytes } from 'crypto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { UserService } from 'src/user/user.service';
import { Currency } from 'src/payment/enums/currency.enum';
import { CurrencyService } from 'src/currency/currency.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: PaginateModel<Wallet>,
    private readonly userService: UserService,
    private readonly currencyService: CurrencyService

  ) { }

  async create(createWalletDto: CreateWalletDto, session?: ClientSession): Promise<Wallet> {
    const existingWallet = await this.walletModel.findOne({
      userId: createWalletDto.userId
    });

    if (existingWallet) throw new ConflictException('User already has a wallet');

    const walletAddress = this.generateWalletAddress();

    const wallet = new this.walletModel({
      ...createWalletDto,
      walletAddress
    });

    return await wallet.save({ session });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ wallets: Wallet[], total: number }> {
    const skip = (page - 1) * limit;

    const [wallets, total] = await Promise.all([
      this.walletModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email username')
        .exec(),
      this.walletModel.countDocuments()
    ]);

    return { wallets, total };
  }

  async findByUserIdentifier(userIdentifier: string): Promise<Wallet> {
    const foundedUser = await this.userService.findOne(userIdentifier);
    if (!foundedUser) {
      throw new NotFoundException('User not found');
    }


    if (!foundedUser.walletId) throw new NotFoundException('Wallet not found for this user');
    const foundedWallet = await this.findOne(foundedUser.walletId.toString())
    return foundedWallet.populate("transactionsHistory");
  }

  async findOne(id: string, session?: ClientSession): Promise<Wallet> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid wallet ID format');
    }
    console.log({ id })

    const wallet = await this.walletModel.findOne({ _id: id }, null, { session })

    if (!wallet) throw new NotFoundException(`Wallet with ID ${id} not found`);

    console.log({ wallet })

    return wallet;
  }

  async findByUserId(userId: string, session?: ClientSession): Promise<Wallet> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const wallet = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId) }, null, { session })
      .populate('userId', 'email username')
      .exec();

    if (!wallet) throw new NotFoundException(`Wallet for user ${userId} not found`);

    return wallet;
  }

  async findByWalletAddress(walletAddress: string): Promise<Wallet> {
    const wallet = await this.walletModel
      .findOne({ walletAddress })
      .populate('userId', 'email username')
      .exec();

    if (!wallet) throw new NotFoundException(`Wallet with address ${walletAddress} not found`);

    return wallet;
  }

  async update(id: string, updateWalletDto: UpdateWalletDto): Promise<Wallet> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid wallet ID format');
    }

    const wallet = await this.walletModel
      .findByIdAndUpdate(id, updateWalletDto, { new: true })
      .populate('userId', 'email username')
      .exec();

    if (!wallet) throw new NotFoundException(`Wallet with ID ${id} not found`);

    return wallet;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid wallet ID format');

    const result = await this.walletModel.findByIdAndDelete(id).exec();

    if (!result) throw new NotFoundException(`Wallet with ID ${id} not found`);

  }
  async credit({ transactionDto, id, userId, session }: { transactionDto: WalletTransactionDto; id?: string; userId?: string; session?: ClientSession }): Promise<Wallet> {
    if (!id && !userId) {
      throw new BadRequestException("Must specify id or userId");
    }

    let wallet: Wallet | null = null;

    if (id) {
      wallet = await this.findOne(id, session);
    } else if (userId) wallet = await this.findByUserId(userId, session);

    if (!wallet) throw new NotFoundException("Wallet not found");
    if (wallet.isFrozen) throw new BadRequestException("Wallet is frozen and cannot be credited");
    if (!wallet.isActive) throw new BadRequestException("Wallet is not active");

    if (transactionDto.currency !== Currency.USD) {
      const amountInUsd = this.currencyService.convertToUSD(transactionDto.amount, transactionDto.currency);
      transactionDto.amount = amountInUsd;
    }

    wallet.balance = +(+wallet.balance + +this.currencyService.convertFromUSD(transactionDto.amount, wallet.currency)).toFixed(2);

    wallet.lastTransactionDate = new Date();
    return wallet.save({ session });
  }

  async debit({
    transactionDto,
    id,
    userId,
    session
  }: {
    transactionDto: WalletTransactionDto,
    id?: string,
    userId?: string,
    session?: ClientSession
  }): Promise<Wallet> {
    if (!id && !userId) {
      throw new BadRequestException("Must specify id or userId");
    }
    let wallet: Wallet | null = null;
    if (id) { wallet = await this.findOne(id, session); }
    else if (userId) { wallet = await this.findByUserId(userId, session); }
    if (!wallet) throw new NotFoundException("Wallet not found");
    if (wallet.isFrozen) throw new BadRequestException("Wallet is frozen");
    if (!wallet.isActive) throw new BadRequestException("Wallet is not active");

    if (transactionDto.currency !== Currency.USD) {
      const amountInUsd = this.currencyService.convertToUSD(
        transactionDto.amount,
        transactionDto.currency
      );
      transactionDto.amount = amountInUsd;
    }

    if (this.currencyService.convertToUSD(wallet.balance, Currency.USD) < transactionDto.amount) {
      throw new BadRequestException("Insufficient balance");
    }

    wallet.balance = +(wallet.balance - this.currencyService.convertFromUSD(transactionDto.amount, wallet.currency)).toFixed(2);

    wallet.lastTransactionDate = new Date();
    return wallet.save({ session });
  }

  async freezeWallet(id: string): Promise<Wallet> {
    return await this.update(id, { isFrozen: true });
  }

  async unfreezeWallet(id: string): Promise<Wallet> {
    return await this.update(id, { isFrozen: false });
  }

  async getBalance(id: string): Promise<Wallet> {
    const wallet = await this.findOne(id);
    return wallet
  }

  private generateWalletAddress(): string {
    const prefix = 'WAL';
    const randomPart = randomBytes(16).toString('hex').toUpperCase();
    return `${prefix}_${randomPart}`;
  }

  async getWalletsByStatus(isActive: boolean, isFrozen?: boolean): Promise<Wallet[]> {
    const filter: any = { isActive };

    if (isFrozen !== undefined) {
      filter.isFrozen = isFrozen;
    }

    return await this.walletModel
      .find(filter)
      .populate('userId', 'email username')
      .exec();
  }

  async getTotalBalance(): Promise<{ totalBalance: number; currency: string }> {
    const result = await this.walletModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);

    return {
      totalBalance: result[0]?.totalBalance || 0,
      currency: 'USD' // You might want to handle multiple currencies
    };
  }
}