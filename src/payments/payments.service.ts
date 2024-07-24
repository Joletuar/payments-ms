import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import Stripe from 'stripe';

import { envs } from 'src/config/envs';
import { PaymentsSessionDto } from './dtos/payments-session.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_API_KEY);

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
      // Colocar aqui el Id de mi orden
      payment_intent_data: {
        metadata: { orderId },
      },

      line_items,
      mode: 'payment',
      success_url: envs.SUCCESS_URL,
      cancel_url: envs.CANCEL_URL,
    });

    return session;
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

          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
