// payments.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaypalService } from './paypal.service';
import { Payment, PaymentSchema } from './payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaypalService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
