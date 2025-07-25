import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { CourseType } from '../enum/courseType.enum';



@Schema({ timestamps: true, discriminatorKey: 'type' })
export class CourseContent extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Course' })
    courseId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: String, enum: CourseType, required: true })
    type: CourseType

    @Prop({ type: String, required: true })
    title: string

    @Prop({ type: String, required: false })
    description: string
}


export const CourseContentSchema = SchemaFactory.createForClass(CourseContent);
CourseContentSchema.plugin(mongoosePaginate);
