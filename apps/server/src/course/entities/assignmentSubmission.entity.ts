import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class AssignmentSubmission extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fileUrl: string;
  
  @Prop({ type: Number })
  score: number;

  @Prop({ type: String })
  feedback?: string;
}

export const AssignmentSubmissionSchema =
  SchemaFactory.createForClass(AssignmentSubmission);
AssignmentSubmissionSchema.plugin(mongoosePaginate);
