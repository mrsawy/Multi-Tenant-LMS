import { Types } from 'mongoose';
import { Currency } from '@/lib/data/currency.enum';
import { Status } from './status.enum';
import { Organization } from '../organization/organization.interface';
import { ICategory } from '../category/ICategory';
import { Roles } from './roles.enum';

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
  shortBio?: string
}

export interface Preferences {
  language?: string;
  emailNotifications?: boolean;
  darkMode?: boolean;
}

export interface Role {
  _id: string;
  name: Roles;
  permissions: { action: string, subject: string }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IUser {
  _id: string;
  organizationId?: string;

  username: string;
  email: string;
  phone: string;
  password?: string;

  firstName: string;
  lastName: string;
  roleName: Roles;

  profile?: Profile;
  preferences?: Preferences;

  status?: Status; // 'active' | 'inactive' etc.
  lastLogin?: Date;

  walletId?: string;
  preferredCurrency: Currency; // e.g. 'USD' | 'EUR' | etc.

  createdAt?: Date;
  updatedAt?: Date;
  organization?: Organization
  role: Role;
 

}

export interface IInstructor extends IUser {
  roleName: typeof Roles.INSTRUCTOR;
  organizationId: string;
  totalStudents?: number;
  totalCourses?: number;
  averageRating?: number;
  totalRatings?: number
  totalCoursesReviews?: number;
  averageCoursesRating?: number;
  categoriesIds?: string[];
  categories?: Pick<ICategory, '_id' | 'name'>[];
}
