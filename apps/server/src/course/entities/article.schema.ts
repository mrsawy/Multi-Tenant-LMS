// src/course-content/schemas/article.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Article {
  @Prop({ required: true })
  body: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
