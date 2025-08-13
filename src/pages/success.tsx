import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

interface Booking {
  
  hotelName: string;
  checkIn: string;
  checkOut: string;
  userId: string;
  paymentId: string;
}

interface SessionMetadata {

  hotelName: string;
  checkIn: string;
  checkOut: string;
  userId: string;
}

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!session_id) return;

    async function saveBooking() {
      setLoading(true);
      try {
        // Fetch the checkout session details from Stripe
        const res = await fetch(`/api/stripe-session?session_id=${session_id}`);
        const session = await res.json();

        if (!session || !session.payment_intent) {
          setError('Failed to retrieve session details.');
          setLoading(false);
          return;
        }

        const metadata: SessionMetadata = session.metadata;
        if (!metadata || !metadata.hotelName || !metadata.checkIn || !metadata.checkOut || !metadata.userId) {
          setError('Missing booking metadata.');
          setLoading(false);
          return;
        }

        // Save booking to Supabase
        const { error: supaError } = await supabase
          .from('bookings')
          .insert([
            {
              
              hotel_name: metadata.hotelName,
              check_in: metadata.checkIn,
              check_out: metadata.checkOut,
              user_id: metadata.userId,
              payment_id: session.payment_intent,
              status: 'paid',
            },
          ]);

        if (supaError) {
          console.error('Supabase error:', supaError);
          setError('Failed to save booking.');
        } else {
          setBooking({
            
            hotelName: metadata.hotelName,
            checkIn: metadata.checkIn,
            checkOut: metadata.checkOut,
            userId: metadata.userId,
            paymentId: session.payment_intent,
          });
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while processing your booking.');
      }
      setLoading(false);
    }

    saveBooking();
  }, [session_id]);

  if (loading) {
    return <p className="text-center mt-20 text-xl">Processing your booking...</p>;
  }

  if (error) {
    return <p className="text-center mt-20 text-red-600 text-xl">{error}</p>;
  }

  if (!booking) return null;

  return (
    <main className="container mx-auto p-6 max-w-3xl font-sans bg-white min-h-screen text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-6">Booking Confirmed!</h1>
      <p className="text-lg mb-2">
        Hotel: <strong>{booking.hotelName}</strong>
      </p>
      <p className="text-lg mb-2">
        Check-in: <strong>{booking.checkIn}</strong>
      </p>
      <p className="text-lg mb-2">
        Check-out: <strong>{booking.checkOut}</strong>
      </p>
      <p className="text-lg mb-2">
        Payment ID: <strong>{booking.paymentId}</strong>
      </p>
      <p className="text-gray-600 mt-6">Thank you for booking with StayQuest!</p>
    </main>
  );
}
