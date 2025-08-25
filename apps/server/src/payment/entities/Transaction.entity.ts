import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Currency } from '../enums/currency.enum';

@Schema({ timestamps: true })
export class Transaction extends Document {

  @Prop({ type: String, default: Currency.USD , enum: Currency })
  currency: string ;

  @Prop({
    type: {
      email: { type: String, required: true },
      full_name: { type: String, required: true },
      phone_number: { type: String, required: true },
    },
    required: true,
  })
  client_info: {
    email: string;
    full_name: string;
    phone_number: string;
  };

  @Prop({ type: String, default: null })
  reference_id: string | null;

 

  @Prop({ required: true })
  amount_cents: number;

  @Prop({ required: true })
  created_at: Date;

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
