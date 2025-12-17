// src/course-content/schemas/video.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { VideoType } from '../enum/videoType.enum';

@Schema({ _id: false }) // _id is not needed as it will be part of the parent document
export class Video {
  @Prop({ required: true, enum: VideoType })
  videoType: string;

  @Prop({
    required: function () {
      return this.videoType === VideoType.URL;
    },
    type: String,
  })
  videoUrl: string;

  @Prop({
    required: function () {
      return this.videoType === VideoType.UPLOAD;
    },
  })
  fileKey: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
