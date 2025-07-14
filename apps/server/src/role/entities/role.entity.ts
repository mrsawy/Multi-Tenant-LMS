import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Subjects } from '../enum/subject.enum';
import { Actions } from '../enum/Action.enum';
import { Conditions } from '../enum/Conditions.enum';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop([
        {
            action: { type: String, enum: Actions },
            subject: { type: String, enum: Subjects },
        },
    ])
    permissions: {
        action: Actions;
        subject: Subjects;
        condition?: Conditions
    }[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
