import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AssignmentSubmission, AssignmentSubmissionSchema } from './assignmentSubmission.entity';

@Schema({ _id: false })
export class Assignment extends Document<Types.ObjectId> {
  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ type: Number, default: 100 })
  maxPoints?: number;

  @Prop({ type: String })
  fileKey?: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: [AssignmentSubmissionSchema], default: [] })
  submissions: AssignmentSubmission[];
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);


AssignmentSchema.pre('validate', function (next) {
  if (!this.content && !this.fileKey) {
    return next(new Error('At least one content or fileKey must be provided.'));
  }
  next();
});