import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CourseContentSchema } from './course-content.entity';
import { ContentType } from '../enum/contentType.enum';
import { Document, Types } from 'mongoose';
import { QuizSubmission, QuizSubmissionSchema } from './quizSubmission.entity';

@Schema({ _id: false })
class Question {
  @Prop({ required: true })
  questionText: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correctOption: number;
}
const QuestionSchema = SchemaFactory.createForClass(Question);


@Schema({ _id: false })
export class Quiz extends Document {
  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ type: Number, required: false })
  quizDurationInMinutes: number;

  @Prop({ type: Date, required: false })
  quizStartDate: Date;

  @Prop({ type: Date, required: false })
  quizEndDate: Date;

  @Prop({ type: Number, required: true, default: 1 })
  maxAttempts: number;

  @Prop({ type: [QuizSubmissionSchema], default: [] })
  quizSubmissions: QuizSubmission[];
}
export const QuizSchema = SchemaFactory.createForClass(Quiz);
