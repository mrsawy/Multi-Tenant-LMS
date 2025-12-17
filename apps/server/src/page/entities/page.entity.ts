import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class Page extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ type: Object, required: true })
  pageData: Record<string, any>;

  @Prop({ default: false })
  published: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
PageSchema.plugin(mongoosePaginate);
// Create index for slug to ensure uniqueness and faster queries

PageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

PageSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true,
});
PageSchema.set('toJSON', { virtuals: true });
PageSchema.set('toObject', { virtuals: true });

PageSchema.index({ slug: 1 });
