// src/course-content/schemas/quiz.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
class Question {
    @Prop({ required: true })
    questionText: string;

    @Prop({ type: [String], required: true })
    options: string[];

    @Prop({ required: true })
    correctOption: number; // Index of the correct option in the options array
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ _id: false })
export class Quiz {
    @Prop({ type: [QuestionSchema], required: true })
    questions: Question[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);