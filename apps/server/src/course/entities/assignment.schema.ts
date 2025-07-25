
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Assignment {
    @Prop({ required: true, type: Date })
    dueDate: Date;

    @Prop({ type: Number, default: 100 })
    maxPoints?: number;

    @Prop({ type: String, required: true })
    fileUrl: string;

}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);