// option.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Option extends Document {
    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ type: Object, required: true })
    value: any;

    @Prop({ default: null })
    organizationId?: string; // for multi-tenant support
}

export const OptionSchema = SchemaFactory.createForClass(Option);
