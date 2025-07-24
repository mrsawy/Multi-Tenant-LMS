// src/quiz-submissions/schemas/quiz-submission.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';


@Schema({ timestamps: true })
export class QuizSubmission extends Document {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    student: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, ref: 'Organization' })
    organization: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true, ref: 'Quiz' })
    quiz: Types.ObjectId;

    @Prop({
        type: [
            {
                questionId: { type: Types.ObjectId, ref: 'Question', required: true },
                answer: { type: String, required: true },
                isCorrect: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    answers: {
        questionId: Types.ObjectId;
        answer: string;
        isCorrect: boolean; // Indicates if the answer is correct
    }[];

    @Prop({ type: Number })
    score?: number;

    @Prop({ type: String })
    feedback?: string;

    @Prop({ type: Date, default: Date.now })
    submittedAt: Date;
}

export const QuizSubmissionSchema = SchemaFactory.createForClass(QuizSubmission);

QuizSubmissionSchema.plugin(mongoosePaginate);

QuizSubmissionSchema.pre('validate', function (next) {
    if (!this.answers || this.answers.length === 0) {
        return next(new Error('At least one answer must be provided.'));
    }
    next();
});