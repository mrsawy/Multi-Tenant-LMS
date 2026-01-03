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
