import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ReviewType } from '../enum/reviewType.enum';

@Schema({
    timestamps: true,
    discriminatorKey: 'reviewType',
    collection: 'reviews',
})
export class Review extends Document<Types.ObjectId> {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: ReviewType, required: true })
    reviewType: string;

    @Prop({ type: Number, required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ type: String, required: false })
    comment: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

ReviewSchema.plugin(mongoosePaginate);
