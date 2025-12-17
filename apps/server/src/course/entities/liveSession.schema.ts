import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LiveSessionAttendance, LiveSessionAttendanceSchema } from './liveSessionAttendance.entity';


const LIVE_SESSION_PLATFORMS = ['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER'] as const;


@Schema({ _id: false })
export class LiveSession extends Document {
  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, type: String })
  meetingUrl: string;

  @Prop({ type: String })
  meetingId?: string;

  @Prop({ type: String })
  meetingPassword?: string;

  @Prop({ type: String, enum: LIVE_SESSION_PLATFORMS, default: 'OTHER' })
  platform?: (typeof LIVE_SESSION_PLATFORMS)[number];

  @Prop({ type: String })
  recordingUrl?: string;

  @Prop({ type: Number, min: 0 })
  durationInMinutes?: number;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [LiveSessionAttendanceSchema], default: [] })
  attendance: LiveSessionAttendance[];
}

export const LiveSessionSchema = SchemaFactory.createForClass(LiveSession);

LiveSessionSchema.pre('validate', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('endDate must be after startDate.'));
  }
  next();
});
