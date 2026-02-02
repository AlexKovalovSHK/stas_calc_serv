import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModuleDocument = ModuleMongoModel & Document;

@Schema({
    collection: 'ifob_scool_modules',
    timestamps: true
})
export class ModuleMongoModel {

    _id: Types.ObjectId;
    
    @Prop({ required: true })
    courseId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: [String], default: [] })
    topics: string[];

    @Prop({ default: '' })
    homework: string;

    @Prop({ default: '' })
    image: string;

    @Prop({ required: true })
    author: string;

    @Prop({ default: 0, min: 0, max: 5 })
    rating: number;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

}

export const ModuleSchema = SchemaFactory.createForClass(ModuleMongoModel);