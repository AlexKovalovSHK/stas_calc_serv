// payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ 
    collection: 'ifob_scool_paypal',
    timestamps: true
})
export class Payment {
  @Prop({ required: true })
  userId: string; // id пользователя

  @Prop({ required: true })
  courseId: string; // id курса

  @Prop({ required: true })
  orderId: string; // PayPal order ID

  @Prop({ required: true })
  status: string; // COMPLETED, PENDING, DENIED, REFUNDED

  @Prop({ required: true })
  amount: number; // сумма оплаты

  @Prop({ default: 'PAYPAL' })
  provider: string; // PayPal или Stripe
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
