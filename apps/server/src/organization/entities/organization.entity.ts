import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Plans } from '../enums/plans.enums';
import { Status } from '../enums/subscription.enum';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import mongoose, { Document, Types } from 'mongoose';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';

@Schema({ timestamps: true })
export class Organization extends Document<Types.ObjectId> {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  superAdminId: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, type: String })
  planName: string;

  @Prop({ type: Object })
  subscription: SubscriptionTypeDef;

  @Prop({
    type: {
      branding: {
        logo: String,
        primaryColor: String,
        secondaryColor: String,
      },
      notifications: {
        emailEnabled: Boolean,
        smsEnabled: Boolean,
      },
    },
    default: {
      branding: {
        primaryColor: '#000',
        secondaryColor: '#fff',
      },
      notifications: {
        emailEnabled: false,
        smsEnabled: false,
      },
    },
    required: true,
  })
  settings: {
    branding: {
      logo: string;
      primaryColor: string;
      secondaryColor: string;
    };
    notifications: {
      emailEnabled: boolean;
      smsEnabled: boolean;
    };
  };

  @Prop({
    type: {
      totalReviews: Number,
      averageRating: Number,
      averageCoursesRating: Number,
      totalCoursesReviews: Number,
      totalEnrollments: Number,
      totalCourses: Number,
    },
    default: {
      totalReviews: 0,
      averageRating: 0,
      averageCoursesRating: 0,
      totalCoursesReviews: 0,
      totalEnrollments: 0,
      totalCourses: 0,
    },
    required: false,
  })
  stats: {
    totalReviews: number;
    averageRating: number;
    averageCoursesRating: number;
    totalCoursesReviews: number;
    totalEnrollments: number;
    totalCourses: number;
  }
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.plugin(mongoosePaginate);

OrganizationSchema.virtual('plan', {
  ref: 'Plan',
  localField: 'planName',
  foreignField: 'name',
  justOne: true,
});
OrganizationSchema.virtual('superAdmin', {
  ref: 'User',
  localField: 'superAdminId',
  foreignField: '_id',
  justOne: true,
});
OrganizationSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});