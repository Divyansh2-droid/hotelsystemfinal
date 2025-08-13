// pages/booking-success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Booking {
  id: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  user_id: string;
  payment_id: string;
  status: string;
}

interface SessionMetadata {
  hotelName: string;
  checkIn: string;
  checkOut: string;
  userId: string;
}

export default function BookingSuccess() {
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
        // Fetch Stripe session details
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

        // Prevent duplicate bookings
        const { data: existingBooking } = await supabase
          .from('bookings')
          .select('*')
          .eq('payment_id', session.payment_intent)
          .single();

        if (existingBooking) {
          setBooking(existingBooking);
          setLoading(false);
          return;
        }

        // Insert new booking if it doesn't exist
        const { data: newBooking, error: supaError } = await supabase
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
          ])
          .select()
          .single();

        if (supaError) {
          console.error('Supabase insert error:', supaError);
          setError('Failed to save booking.');
        } else {
          setBooking(newBooking);
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while processing your booking.');
      }

      setLoading(false);
    }

    saveBooking();
  }, [session_id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-indigo-600 text-xl animate-pulse">Processing your booking...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 text-xl">{error}</p>
      </div>
    );

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">Thank you for booking with StayQuest.</p>

        <div className="bg-gray-100 rounded-xl p-6 space-y-4 mb-6 text-left">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Hotel:</span>
            <span className="text-gray-800">{booking.hotel_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Check-in:</span>
            <span className="text-gray-800">{new Date(booking.check_in).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Check-out:</span>
            <span className="text-gray-800">{new Date(booking.check_out).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Payment ID:</span>
            <span className="text-gray-800 break-all">{booking.payment_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Status:</span>
            <span className="text-green-600 font-semibold">{booking.status}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
