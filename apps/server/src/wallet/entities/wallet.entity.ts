// src/wallet/schemas/wallet.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
@Schema({
    timestamps: true,
    collection: 'wallets'
})
export class Wallet extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: false, type: Types.ObjectId, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ required: true, default: 0, min: 0, type: Number })
    balance: number;

    @Prop({ default: 'USD' })
    currency: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isFrozen: boolean;

    @Prop()
    lastTransactionDate: Date;

    @Prop({ type: Object })
    metadata: Record<string, any>;
}




export const WalletSchema = SchemaFactory.createForClass(Wallet);
WalletSchema.plugin(mongoosePaginate);

WalletSchema.virtual("user", { ref: "User", localField: "userId", foreignField: "_id", justOne: true })
WalletSchema.virtual("organization", { ref: "Organization", localField: "organizationId", foreignField: "_id", justOne: true })


WalletSchema.set('toJSON', { virtuals: true });
WalletSchema.set('toObject', { virtuals: true });

