import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Plans } from "../enums/plans.enums";
import { Status } from "../enums/subscription.enum";
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class Organization {

    @Prop({ required: true, unique: true })
    name: string;
    @Prop({ required: true, unique: true })
    slug: string;

    @Prop()
    domain?: string;

    @Prop({ required: true, enum: Plans, default: Plans.NONE })
    plan: Plans;

    @Prop({
        type: {
            status: { type: String, enum: Status, required: true },
            plan: { type: String, enum: Plans, required: true },
            startDate: Date,
            endDate: Date,
        },
        // required: true
    })
    subscription: {
        status: string;
        planId: string;
        startDate: Date;
        endDate: Date;
    };

    @Prop({
        type: {
            branding: {
                logo: String,
                primaryColor: String,
                secondaryColor: String
            },
            notifications: {
                emailEnabled: Boolean,
                smsEnabled: Boolean
            }
        },
        default: {
            branding: {
                primaryColor: "#000",
                secondaryColor: "#fff",
            },
            notifications: {
                emailEnabled: false,
                smsEnabled: false
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
        notifications: {
            emailEnabled: boolean;
            smsEnabled: boolean;
        };
    };
}



export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.plugin(mongoosePaginate);