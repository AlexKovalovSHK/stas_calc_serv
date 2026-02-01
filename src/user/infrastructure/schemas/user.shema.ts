import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserMongoModel & Document;

@Schema({ 
    collection: 'ifob_scool_users', // Указываем имя коллекции
    timestamps: true // Автоматически добавит createdAt и updatedAt
})
export class UserMongoModel {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    @Prop({ required: true }) // Пароль обязателен для обычной регистрации
    password: string;

    @Prop({ default: 'Student' })
    role: string;

    @Prop()
    phone: string;

    @Prop()
    avatar: string;

    // Telegram данные
    @Prop({ unique: true, sparse: true }) // sparse позволяет иметь несколько null значений
    telegram_id: number;

    @Prop()
    telegram_username: string;
}

export const UserSchema = SchemaFactory.createForClass(UserMongoModel);