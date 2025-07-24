import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { Status } from '../enum/status.enum';

export type UserDocument = User & Document;

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
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId;


  @Prop({ type: String, unique: true })
  username: string


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
  role: string;

  @Prop({ type: Profile , required: false })
  profile: Profile;

  @Prop({ type: Preferences })
  preferences: Preferences;

  @Prop({ enum: Status, default: 'active' })
  status: string;

  @Prop()
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate)