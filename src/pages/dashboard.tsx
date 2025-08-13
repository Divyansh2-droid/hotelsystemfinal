import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface Booking {
  id: string;
  hotel_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment_id: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    supabase
      .from<Booking>('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data);
        setLoading(false);
      });
  }, [user]);

  const cancelBooking = async (id: string) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium text-gray-700">
          Please login to view your dashboard.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Your Bookings
        </h1>

        {loading && (
          <p className="text-center text-lg text-gray-600">Loading your bookings...</p>
        )}

        {!loading && bookings.length === 0 && (
          <p className="text-center text-gray-500 text-lg mt-10">
            No bookings found. Start exploring hotels!
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`border rounded-xl shadow-md p-6 flex flex-col justify-between transition transform hover:scale-105 hover:shadow-xl ${
                booking.status === 'cancelled' ? 'opacity-60' : ''
              }`}
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 truncate">
                  {booking.hotel_name}
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">Check-in:</span>{' '}
                  {new Date(booking.check_in_date).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Check-out:</span>{' '}
                  {new Date(booking.check_out_date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Payment ID:</span> {booking.payment_id}
                </p>
                <p
                  className={`mt-2 font-semibold ${
                    booking.status === 'paid'
                      ? 'text-green-600'
                      : booking.status === 'cancelled'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  Status: {booking.status.toUpperCase()}
                </p>
              </div>

              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => cancelBooking(booking.id)}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
