// paypal.service.ts
import * as paypal from '@paypal/checkout-server-sdk';

export class PaypalService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const env = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );

    this.client = new paypal.core.PayPalHttpClient(env);
  }

  async createOrder(price: number) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');

    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: price.toFixed(2),
          },
        },
      ],
    });

    const response = await this.client.execute(request);
    return response.result;
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }
}
