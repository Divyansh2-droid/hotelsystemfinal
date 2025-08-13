// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { hotelId, hotelName, checkIn, checkOut, userId } = req.body;

  if ( !hotelName || !checkIn || !checkOut || !userId) {
    return res.status(400).json({ error: 'Missing booking information' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${hotelName} Booking` },
            unit_amount: 10000, // $100 in cents, adjust as needed
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/hotel/${hotelId}`,
    metadata: {
  
  hotelName: req.body.hotelName,
  checkIn: req.body.checkIn,
  checkOut: req.body.checkOut,
  userId: req.body.userId,
},

    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create Stripe checkout session' });
  }
}
