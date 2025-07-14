import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop()
    description: string;

    @Prop()
    icon: string; // e.g. "code", "laptop", etc. (FontAwesome or Material Icons)

    @Prop()
    color: string; // hex format (e.g. "#ff6b6b")

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null })
    parentId: Types.ObjectId | null;

    @Prop({ default: 0 })
    order: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export type CategoryDocument = Category & Document;