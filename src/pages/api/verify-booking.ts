// pages/api/verify-booking.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Initialize Supabase client with Service Role Key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Must use service role key on server
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    // Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const metadata = session.metadata;

    // Validate metadata
    if (
      !metadata ||
      !metadata.hotelName ||
      !metadata.checkIn ||
      !metadata.checkOut ||
      !metadata.userId
    ) {
      return res.status(400).json({ error: 'Missing booking metadata' });
    }

    // Insert booking into Supabase
    const { error } = await supabase.from('bookings').insert([
      {
        
        hotel_name: metadata.hotelName,
        check_in: metadata.checkIn,
        check_out: metadata.checkOut,
        user_id: metadata.userId,
        payment_id: session.payment_intent,
        status: 'confirmed',
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save booking' });
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Booking verification error:', err);
    res.status(500).json({ error: 'Failed to verify booking' });
  }
}
