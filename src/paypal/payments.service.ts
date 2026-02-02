// payments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

  async createPayment(data: {
    userId: string;
    courseId: string;
    orderId: string;
    amount: number;
    status: string;
  }) {
    const payment = new this.paymentModel(data);
    return payment.save();
  }

  async updatePaymentStatus(orderId: string, status: string) {
    return this.paymentModel.findOneAndUpdate({ orderId }, { status }, { new: true });
  }

  async getPaymentsForUser(userId: string) {
    return this.paymentModel.find({ userId }).exec();
  }
}
