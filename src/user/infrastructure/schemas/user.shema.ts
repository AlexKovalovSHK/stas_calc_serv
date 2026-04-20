import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserMongoModel & Document;



@Schema({ _id: false })
export class AcademicInfo {
  @Prop({ type: String, enum: ['GENERAL', 'CHSM'], default: 'GENERAL' })
  subdivision: string;

  @Prop({ type: Number, index: true })
  course: number;

  @Prop({ type: String, index: true })
  sessionNumber: string;

  @Prop({ type: Date, index: true })
  enrollmentDate: Date;
}

@Schema({
  collection: 'ifob_scool_users',
  timestamps: true,
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

  @Prop({ type: AcademicInfo, _id: false, required: false })
  academicInfo?: AcademicInfo;
}

export const UserSchema = SchemaFactory.createForClass(UserMongoModel);
