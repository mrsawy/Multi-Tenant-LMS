// src/course-content/schemas/video.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false }) // _id is not needed as it will be part of the parent document
export class Video {


    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    creator: Types.ObjectId;

    @Prop({ required: true })
    url: string;

    //   @Prop({ required: true })
    //   duration: number; // in seconds
}

export const VideoSchema = SchemaFactory.createForClass(Video);
