import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';



@Schema({ timestamps: true })
export class CourseContent extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Course' })
    courseId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ required: true, type: Types.Array })
    Content: string[];


}


export const CourseContentSchema = SchemaFactory.createForClass(CourseContent);
CourseContentSchema.plugin(mongoosePaginate);
