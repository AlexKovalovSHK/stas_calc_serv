import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = CourseMongoModel & Document;

@Schema({ 
    collection: 'ifob_scool_courses',
    timestamps: true
})
export class CourseMongoModel {
    _id: Types.ObjectId;
    
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    priceAmount: number;

    @Prop({ required: true, default: 'RUB' })
    priceCurrency: string;

    @Prop({ required: true })
    authorId: string;

    @Prop({ default: '' })
    note: string;

    @Prop({ default: 'DRAFT' })
    status: string;

    @Prop({ type: [String], default: [] }) // массив ID модулей
    modules: string[];

    @Prop({ default: 'image' })
    image: string;
    
    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

  
}

export const CourseSchema = SchemaFactory.createForClass(CourseMongoModel);