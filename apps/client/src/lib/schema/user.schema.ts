import * as yup from 'yup';

import { Status } from '@/lib/types/user/status.enum';
import { Currency } from '../data/currency.enum';

// Address schema
const addressSchema = yup.object({
  street: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zipCode: yup.string().optional(),
  country: yup.string().optional(),
});

// Social links schema
const socialLinksSchema = yup.object({
  linkedin: yup.string().url('Invalid LinkedIn URL').optional(),
  twitter: yup.string().url('Invalid Twitter URL').optional(),
});

// Profile schema
const profileSchema = yup.object({
  bio: yup.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  shortBio: yup.string().max(200, 'Short bio must be less than 200 characters').optional(),
  avatar: yup.string().url('Invalid avatar URL').optional(),
  dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
  address: addressSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
});

// Preferences schema
const preferencesSchema = yup.object({
  language: yup.string().default('en'),
  emailNotifications: yup.boolean().default(true),
  darkMode: yup.boolean().default(false),
});

// Base user schema for common fields
const baseUserSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  role: yup.string().required('Role is required'),
  organizationId: yup.string().optional(),
  profile: profileSchema.optional(),
  preferences: preferencesSchema.optional(),
  status: yup.string().oneOf(Object.values(Status)).default(Status.ACTIVE),
  preferredCurrency: yup.string().oneOf(Object.values(Currency)).required('Preferred currency is required'),
});

// Create user schema (includes password)
export const createUserSchema = baseUserSchema.shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Edit user schema (password is optional)
export const editUserSchema = baseUserSchema.shape({
  _id: yup.string().required('User ID is required'),
  password: yup
    .string()
    .optional()
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup
    .string()
    .optional()
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: (schema) => schema.required('Please confirm your password').oneOf([yup.ref('password')], 'Passwords must match'),
    }),
});

// Type definitions
export type CreateUserFormData = yup.InferType<typeof createUserSchema>;
export type EditUserFormData = yup.InferType<typeof editUserSchema>;

// User interface (matching your Mongoose model)
export interface IUser {
  _id: string;
  organizationId?: string;
  username: string;
  email: string;
  phone: string;
  password?: string; // Optional in responses for security
  firstName: string;
  lastName: string;
  role: string;
  profile?: {
    bio?: string;
    shortBio?: string;
    avatar?: string;
    dateOfBirth?: Date;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
    };
  };
  preferences?: {
    language: string;
    emailNotifications: boolean;
    darkMode: boolean;
  };
  status: string;
  lastLogin?: Date;
  walletId?: string;
  preferredCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums (you'll need to create these files)
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum UserCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  // Add more currencies as needed
}