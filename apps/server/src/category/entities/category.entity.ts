import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as mongoosePaginate from "mongoose-paginate-v2"
@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null, required: false })
    parentId: Types.ObjectId | null;


}

export const CategorySchema = SchemaFactory.createForClass(Category);



CategorySchema.plugin(mongoosePaginate)