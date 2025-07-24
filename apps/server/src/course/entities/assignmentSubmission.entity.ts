import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class AssignmentSubmission extends Document {

    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    student: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, ref: 'Organization' })
    organization: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, ref: 'Assignment' })
    assignment: Types.ObjectId;

    @Prop({ type: String })
    content?: string;

    @Prop({ type: String })
    fileUrl?: string;

    @Prop({ type: Date, default: Date.now })
    submittedAt: Date;

    @Prop({ type: Number })
    score?: number;

    @Prop({ type: String })
    feedback?: string;
}

export const AssignmentSubmissionSchema = SchemaFactory.createForClass(AssignmentSubmission);
AssignmentSubmissionSchema.plugin(mongoosePaginate);
// Add custom validation
AssignmentSubmissionSchema.pre('validate', function (next) {
    if (!this.content && !this.fileUrl) {
        return next(new Error('Either content or fileUrl is required.'));
    }
    next();
});
