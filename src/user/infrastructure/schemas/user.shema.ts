import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserMongoModel & Document;

@Schema({ 
    collection: 'ifob_scool_users',
    timestamps: true
})
export class UserMongoModel {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: [String], default: ['Student'] }) 
    role: string[];

    @Prop()
    phone: string;

    @Prop()
    avatar: string;

    @Prop({ unique: true, sparse: true })
    telegram_id: number;

    @Prop()
    telegram_username: string;
}

export const UserSchema = SchemaFactory.createForClass(UserMongoModel);