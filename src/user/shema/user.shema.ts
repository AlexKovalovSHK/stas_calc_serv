import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  telefon?: string;
  @Prop()
  companyName?: string;
  @Prop()
  street?: string;
  @Prop()
  houseNumber?: string;
  @Prop()
  country?: string;
  @Prop()
  ort?: string;
  @Prop()
  plz?: string;
  @Prop()
  image?: string;
  @Prop()
  userBank?: string;
  @Prop()
  swift_bic?: string;
  @Prop()
  paypal?: string;
  @Prop()
  iban?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
