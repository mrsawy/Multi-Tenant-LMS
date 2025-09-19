import { Types } from 'mongoose';
import { Currency } from '@/lib/data/currency.enum';
import { Status } from './status.enum';
import { Organization } from '../organization/organization.interface';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
}

export interface Profile {
  bio?: string;
  avatar?: string;
  dateOfBirth?: Date;
  address?: Address;
  socialLinks?: SocialLinks;
  shortBio?:string
}

export interface Preferences {
  language?: string;
  emailNotifications?: boolean;
  darkMode?: boolean;
}

export interface IUser {
  _id?: string;
  organizationId?: string;

  username: string;
  email: string;
  phone: string;
  password: string;

  firstName?: string;
  lastName?: string;
  role: string;

  profile?: Profile;
  preferences?: Preferences;

  status?: Status; // 'active' | 'inactive' etc.
  lastLogin?: Date;

  walletId?: string;
  preferredCurrency: Currency; // e.g. 'USD' | 'EUR' | etc.

  createdAt?: Date;
  updatedAt?: Date;
  organization?: Organization


}
