import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Status } from '../enum/status.enum';
import { Currency } from 'src/payment/enums/currency.enum';

export type UserDocument = User & Document<Types.ObjectId>;

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
export class User {
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

  @Prop({ enum: Status, default: 'active' })
  status: string;

  @Prop()
  lastLogin: Date;

  @Prop({ type: mongoose.Types.ObjectId })
  walletId: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: Currency, required: true })
  preferredCurrency: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate);

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
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
