import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { Request } from 'express';
import Stripe from 'stripe';

import { envs } from 'src/config/envs';
import { PaymentsSessionDto } from './dtos/payments-session.dto';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_API_KEY);
  private readonly logger = new Logger('PaymentsService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(paymentsSessionDto: PaymentsSessionDto) {
    const { currency, items, orderId } = paymentsSessionDto;

    const line_items = items.map(({ name, price, quantity }) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: name,
        },
        unit_amount: Math.floor(price * 100), //20 dolares
      },
      quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: { orderId },
      },

      line_items,
      mode: 'payment',
      success_url: envs.SUCCESS_URL,
      cancel_url: envs.CANCEL_URL,
    });

    return {
      cancel_url: session.cancel_url,
      success_url: session.success_url,
      url: session.url,
    };
  }

  async stripeWebhookHandler(req: Request) {
    const sig = req.headers['stripe-signature'];

    try {
      const event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        envs.ENDPOINT_SECRET,
      );

      switch (event.type) {
        case 'charge.succeeded':
          const metadata = event.data.object.metadata;
          const orderId = metadata.orderId;
          const chargeSucceded = event.data.object;

          const payload = {
            stripePaymentId: chargeSucceded.id,
            orderId,
            receiptUrl: chargeSucceded.receipt_url,
          };

          this.logger.log({ payload });

          // emit no necesita una respuesta
          this.client.emit('payment.succeded', payload);

          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
