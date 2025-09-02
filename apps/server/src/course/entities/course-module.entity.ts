import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';



@Schema({ timestamps: true, collection: 'course_modules' })
export class CourseModule extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Course' })
    courseId: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Organization' })
    organizationId: Types.ObjectId;

    @Prop({ type: String, required: true, ref: 'User', refPath: 'username' })
    createdBy: string;


    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'CourseContent' }], default: [] })
    contentsIds: Types.ObjectId[];
    

    @Prop({ type: String, required: true })
    title: string

    @Prop({ type: String, required: false })
    description: string
}

export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);


CourseModuleSchema.plugin(mongoosePaginate);


CourseModuleSchema.virtual('contents', { ref: 'CourseContent', localField: 'contentsIds', foreignField: '_id', justOne: false });
CourseModuleSchema.virtual('creator', { ref: 'User', localField: 'createdBy', foreignField: 'username', justOne: true });
CourseModuleSchema.virtual('course', { ref: 'Course', localField: 'courseId', foreignField: '_id', justOne: true });
CourseModuleSchema.virtual('organization', { ref: 'Organization', localField: 'organizationId', foreignField: '_id', justOne: true });

CourseModuleSchema.set('toJSON', { virtuals: true });
CourseModuleSchema.set('toObject', { virtuals: true });
