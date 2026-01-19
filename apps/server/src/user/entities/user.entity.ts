import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Status } from '../enum/status.enum';
import { Currency } from 'src/payment/enums/currency.enum';
import { Roles } from 'src/role/enum/Roles.enum';

export type UserDocument = User & Document<Types.ObjectId>;

/**
 * Creates a validator configuration for instructor-only number fields
 * @param fieldName - The name of the field for error messages
 * @returns Mongoose validator configuration object
 */
function createInstructorOnlyNumberValidator(fieldName: string) {
  return {
    validator: function (value: number) {
      // If value is 0 or undefined, it's valid
      if (value === 0 || value === undefined || value === null) {
        return true;
      }
      // If value is provided and non-zero, roleName must be INSTRUCTOR
      return (
        this.roleName &&
        this.roleName.toLowerCase() === Roles.INSTRUCTOR.toLowerCase()
      );
    },
    message: `${fieldName} is only acceptable for INSTRUCTOR role`,
  };
}

@Schema({ _id: false })
class Address {
  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop()
  country: string;
}

@Schema({ _id: false })
class SocialLinks {
  @Prop()
  linkedin: string;

  @Prop()
  twitter: string;
}

@Schema({ _id: false })
class Profile {
  @Prop()
  bio: string;

  @Prop()
  shortBio: string;

  @Prop()
  avatar: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ type: Address })
  address: Address;

  @Prop({ type: SocialLinks })
  socialLinks: SocialLinks;
}

@Schema({ _id: false })
class Preferences {
  @Prop()
  language: string;

  @Prop()
  emailNotifications: boolean;

  @Prop()
  darkMode: boolean;
}

@Schema({ timestamps: true })
export class User extends Document<mongoose.Types.ObjectId> {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false })
  organizationId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true, // Add index for better query performance
    trim: true,
    lowercase: true, // Optional: store usernames in lowercase
  })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
  // 👇 Link to role by name instead of ID
  @Prop({ type: String, ref: 'Role', required: true })
  roleName: string;

  @Prop({ type: Profile, required: false })
  profile: Profile;

  @Prop({ type: Preferences })
  preferences: Preferences;

  @Prop({ type: String, enum: Status, default: 'active' })
  status: string;

  @Prop()
  lastLogin: Date;

  @Prop({ type: mongoose.Types.ObjectId })
  walletId: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: Currency, required: true })
  preferredCurrency: string;

  @Prop({
    type: Number,
    required: false,
    validate: createInstructorOnlyNumberValidator('averageRating'),
  })
  averageRating?: number;

  @Prop({
    type: Number,
    required: false,
    validate: createInstructorOnlyNumberValidator('totalReviews'),
  })
  totalReviews?: number;

  @Prop({
    type: Number,
    required: false,
    validate: createInstructorOnlyNumberValidator('averageCoursesRating'),
  })
  averageCoursesRating?: number;

  @Prop({
    type: Number,
    required: false,
    validate: createInstructorOnlyNumberValidator('totalCoursesReviews'),
  })
  totalCoursesReviews?: number;

  @Prop({
    type: Number,
    required: false,
    validate: createInstructorOnlyNumberValidator('totalStudents'),
  })
  totalStudents?: number;

  @Prop({
    type: Number,
    required: false,
    validate: createInstructorOnlyNumberValidator('totalCourses'),
  })
  totalCourses?: number;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: 'Category',
    default: [],
    validate: {
      validator: function (value: Types.ObjectId[]) {
        // If categoriesIds is empty or undefined, it's valid
        if (!value || value.length === 0) {
          return true;
        }
        // If categoriesIds is provided, roleName must be INSTRUCTOR
        return (
          this.roleName &&
          this.roleName.toLowerCase() === Roles.INSTRUCTOR.toLowerCase()
        );
      },
      message: 'categoriesIds is only acceptable for INSTRUCTOR role',
    },
  })
  categoriesIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate);

// Compound index for featured instructors query performance
UserSchema.index(
  {
    roleName: 1,
    totalCourses: 1,
    totalCoursesReviews: -1,
  },
  {
    name: 'featured_instructors_idx',
    background: true,
  },
);

// Pre-save hook to reset instructor-only fields if user is not an instructor
UserSchema.pre('save', function (next) {
  const isInstructor = this.roleName &&
    this.roleName.toLowerCase() === Roles.INSTRUCTOR.toLowerCase();

  // If not an instructor, set all instructor-only fields to undefined
  if (!isInstructor) {
    this.averageRating = undefined;
    this.totalReviews = undefined;
    this.averageCoursesRating = undefined;
    this.totalCoursesReviews = undefined;
    this.totalStudents = undefined;
    this.totalCourses = undefined;
  }

  next();
});

UserSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true,
});
UserSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: 'walletId',
  foreignField: '_id',
  justOne: true,
});
UserSchema.virtual('role', {
  ref: 'Role',
  localField: 'roleName',
  foreignField: 'name',
  justOne: true,
});
UserSchema.virtual('categories', {
  ref: 'Category',
  localField: 'categoriesIds',
  foreignField: '_id',
  justOne: false,
});
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
