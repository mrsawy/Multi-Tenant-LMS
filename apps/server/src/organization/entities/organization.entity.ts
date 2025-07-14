import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Plans } from "../enums/plans.enums";
import { Subscription } from "../enums/subscription.enum";
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class Organization {

    @Prop({ required: true, unique: true })
    name: string;
    @Prop({ required: true, unique: true })
    slug: string;

    @Prop()
    domain?: string;

    @Prop({ required: true, enum: Plans })
    plan: Plans;

    @Prop({
        type: {
            status: { type: String, enum: Subscription, required: true },
            planId: String,
            startDate: Date,
            endDate: Date,
            stripeCustomerId: String,
        },
        required: true
    })
    subscription: {
        status: string;
        planId: string;
        startDate: Date;
        endDate: Date;
        stripeCustomerId: string;
    };

    @Prop({
        type: {
            branding: {
                logo: String,
                primaryColor: String,
                secondaryColor: String
            },
            features: {
                maxUsers: Number,
                maxCourses: Number,
                certificatesEnabled: Boolean,
                advancedAnalytics: Boolean
            },
            notifications: {
                emailEnabled: Boolean,
                smsEnabled: Boolean
            }
        },
        required: true
    })
    settings: {
        branding: {
            logo: string;
            primaryColor: string;
            secondaryColor: string;
        };
        features: {
            maxUsers: number;
            maxCourses: number;
            // certificatesEnabled: boolean;
            // advancedAnalytics: boolean;
        };
        notifications: {
            emailEnabled: boolean;
            smsEnabled: boolean;
        };
    };
}



export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.plugin(mongoosePaginate);