
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Assignment {

    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    creator: Types.ObjectId;


    @Prop({ required: true, type: String }) // Instructions for the assignment
    description: string;

    @Prop({ required: true, type: Date })
    dueDate: Date;

    @Prop({ type: Number, default: 100 })
    maxPoints?: number;

    @Prop({ type: String, required: false })
    fileUrl?: string;

}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);