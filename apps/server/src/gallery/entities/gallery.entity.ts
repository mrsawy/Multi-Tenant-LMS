
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Document, Types } from 'mongoose';

export type GalleryDocument = Gallery & Document;

@Schema({ timestamps: true })
export class Gallery {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileKey: string;

  @Prop()
  type: string; // mime type

  @Prop()
  title?: string; // Optional title

  @Prop({ default: true }) 
  isPublic: boolean;
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);

GallerySchema.plugin(mongoosePaginate);
