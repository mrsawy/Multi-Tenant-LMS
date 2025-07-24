// src/course-content/schemas/article.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Article {


  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  creator: Types.ObjectId;

  @Prop({ required: true })
  body: string; // The article content in Markdown or HTML

  @Prop({ type: String, required: false })
  fileUrl?: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);