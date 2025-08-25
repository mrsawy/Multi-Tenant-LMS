import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './entities/Transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    ) { }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        const createdTransaction = new this.transactionModel(createTransactionDto);
        return await createdTransaction.save();
    }

    async findAll(): Promise<Transaction[]> {
        return this.transactionModel.find().exec();
    }

    async findById(id: string): Promise<Transaction | null> {
        return this.transactionModel.findById(id).exec();
    }

    async update(id: string, updateData: Partial<CreateTransactionDto>): Promise<Transaction | null> {
        return this.transactionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async delete(id: string): Promise<{ deleted: boolean }> {
        const result = await this.transactionModel.findByIdAndDelete(id).exec();
        return { deleted: !!result };
    }
}
