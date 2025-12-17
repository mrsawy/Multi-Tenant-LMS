import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ContentType } from '../enum/contentType.enum';
import { CourseModuleEntity } from './course-module.entity';
import { QuizSchema } from './quiz.schema';
import { ArticleSchema } from './article.schema';
import { VideoSchema } from './video.schema';
import { AssignmentSchema } from './assignment.schema';

@Schema({
  timestamps: true,
  discriminatorKey: 'type',
  collection: 'course_contents',
})
export class CourseContent extends Document<Types.ObjectId> {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Organization' })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: CourseModuleEntity.name })
  moduleId: Types.ObjectId;

  @Prop({ type: String, required: true, ref: 'User', refPath: 'username' })
  createdBy: string;

  @Prop({ type: String, enum: ContentType, required: true })
  type: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  description: string;
}

export const CourseContentSchema = SchemaFactory.createForClass(CourseContent);

// export const QuizModel = CourseContentSchema.discriminator(ContentType.QUIZ, QuizSchema);
// export const ArticleModel = CourseContentSchema.discriminator(ContentType.ARTICLE, ArticleSchema);
// export const AssignmentModel = CourseContentSchema.discriminator(ContentType.ASSIGNMENT, AssignmentSchema);
// export const VideoModel = CourseContentSchema.discriminator(ContentType.VIDEO, VideoSchema);

CourseContentSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: 'username',
  justOne: true,
});
CourseContentSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});
CourseContentSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true,
});
CourseContentSchema.virtual('module', {
  ref: 'CourseModule',
  localField: 'moduleId',
  foreignField: '_id',
  justOne: true,
});
CourseContentSchema.set('toJSON', { virtuals: true });
CourseContentSchema.set('toObject', { virtuals: true });

CourseContentSchema.plugin(mongoosePaginate);



