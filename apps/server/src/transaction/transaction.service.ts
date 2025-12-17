// src/transaction/transaction.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PaginateModel, Types } from 'mongoose';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: PaginateModel<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    session?: ClientSession,
  ): Promise<Transaction> {
    const transaction = new this.transactionModel(createTransactionDto);
    return await transaction.save({ session });
  }

  async findByWalletId(
    walletId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find({ walletId: new Types.ObjectId(walletId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments({ walletId: new Types.ObjectId(walletId) }),
    ]);

    return { transactions, total };
  }

  async findOne(id: string, session?: ClientSession): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findById(id, null, { session })
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    session?: ClientSession,
    failureReason?: string,
  ): Promise<Transaction> {
    const updateData: any = { status };

    if (status === TransactionStatus.COMPLETED) {
      updateData.processedAt = new Date();
    }

    if (status === TransactionStatus.FAILED && failureReason) {
      updateData.failureReason = failureReason;
    }

    const transaction = await this.transactionModel
      .findByIdAndUpdate(id, updateData, { new: true, session })
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    return await this.transactionModel.findOne({ reference }).exec();
  }

  async getWalletTransactionStats(walletId: string): Promise<{
    totalCredits: number;
    totalDebits: number;
    transactionCount: number;
  }> {
    const stats = await this.transactionModel.aggregate([
      {
        $match: {
          walletId: new Types.ObjectId(walletId),
          status: TransactionStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      totalCredits: 0,
      totalDebits: 0,
      transactionCount: 0,
    };

    stats.forEach((stat) => {
      if (stat._id === TransactionType.CREDIT || stat._id === TransactionType.DEPOSIT) {
        result.totalCredits += stat.total;
      } else if (stat._id === TransactionType.DEBIT || stat._id === TransactionType.WITHDRAWAL) {
        result.totalDebits += stat.total;
      }
      result.transactionCount += stat.count;
    });

    return result;
  }
}