import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { PaypalService } from "./paypal.service";
import { PaymentsService } from "./payments.service";
import { Request, Response } from "express";
import { Public } from "src/auth/public.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paypalService: PaypalService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Public()
  @Post('create-order')
  createOrder(@Body('price') price: number) {
    return this.paypalService.createOrder(price);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture-order')
  async captureOrder(
    @Body('orderId') orderId: string,
    @Body('userId') userId: string,
    @Body('courseId') courseId: string
  ) {
    const result = await this.paypalService.captureOrder(orderId);
  
    // Для отладки — посмотрите полную структуру в логах докера
    // console.log('PayPal Full Result:', JSON.stringify(result, null, 2));
  
    // ПРАВИЛЬНЫЙ ПУТЬ К СУММЕ ПОСЛЕ CAPTURE:
    const amountValue = result.purchase_units[0].payments.captures[0].amount.value;
  
    // Сохраняем платёж
    await this.paymentsService.createPayment({
      userId,
      courseId,
      orderId,
      amount: parseFloat(amountValue),
      status: result.status,
    });
  
    return result;
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const event = req.body;
    console.log('Webhook received:', event.event_type);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.paymentsService.updatePaymentStatus(event.resource.id, 'COMPLETED');
        // TODO: открыть доступ к курсу
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        await this.paymentsService.updatePaymentStatus(event.resource.id, 'DENIED');
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.paymentsService.updatePaymentStatus(event.resource.id, 'REFUNDED');
        break;

      default:
        console.log('Other event:', event.event_type);
    }

    res.status(200).send('OK');
  }
}
