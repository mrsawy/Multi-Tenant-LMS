import { Document, Types } from "mongoose";
import { SubscriptionTypeDef } from "../subscription/subscription.interface";

export interface Organization extends Document {
  name: string;
  superAdminId: Types.ObjectId;
  slug: string;
  domain?: string;
  planName: string;
  subscription?: SubscriptionTypeDef;
  settings: {
    branding: {
      logo?: string;
      primaryColor: string;
      secondaryColor: string;
    };
    notifications: {
      emailEnabled: boolean;
      smsEnabled: boolean;
    };
  };
  // Virtuals
  plan?: any; // or a specific Plan type if available
  superAdmin?: any; // or a specific User type if available
}
