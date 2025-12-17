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
      action: { type: String, enum: Actions, required: true },
      subject: { type: String, enum: Subjects, required: true },
      conditions: { type: [String], enum: Conditions, required: false },
      _id: false,
    },
  ])
  permissions: {
    action: Actions;
    subject: Subjects;
    conditions?: Conditions[];
  }[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
