import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Hotel {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  photos?: { photo_reference: string }[];
  types?: string[];
  description?: string;
}

const amenitiesMap: Record<string, { label: string; icon: JSX.Element }> = {
  spa: { label: 'Spa', icon: <span>🧖‍♀️</span> },
  gym: { label: 'Gym', icon: <span>🏋️‍♂️</span> },
  parking: { label: 'Parking', icon: <span>🅿️</span> },
  pool: { label: 'Pool', icon: <span>🏊‍♂️</span> },
  restaurant: { label: 'Restaurant', icon: <span>🍽️</span> },
  bar: { label: 'Bar', icon: <span>🍹</span> },
  wifi: { label: 'Wi-Fi', icon: <span>📶</span> },
};

export default function HotelDetail() {
  const router = useRouter();
  const { place_id } = router.query;
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Fetch hotel details
  useEffect(() => {
    if (!place_id) return;

    setLoading(true);
    setError('');

    async function fetchHotel() {
      try {
        const res = await axios.get('/api/googlePlaceDetails', {
          params: { place_id },
        });
        setHotel(res.data.result);
      } catch {
        setError('Failed to fetch hotel details.');
      }
      setLoading(false);
    }

    fetchHotel();
  }, [place_id]);

  // Handle booking and Stripe checkout
  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert('Please login to book this hotel.');
      router.push('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError('Please select both check-in and check-out dates.');
      return;
    }

    setBookingError('');
    setBookingLoading(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: hotel?.name,
          checkIn,
          checkOut,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        setBookingError(data.error || 'Failed to start payment.');
        setBookingLoading(false);
      }
    } catch (err) {
      console.error(err);
      setBookingError('Error processing booking.');
      setBookingLoading(false);
    }
  }

  if (loading)
    return (
      <main className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <p className="text-xl text-indigo-600">Loading hotel details...</p>
      </main>
    );

  if (error || !hotel)
    return (
      <main className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl">{error || 'Hotel not found'}</p>
      </main>
    );

  return (
    <main className="container mx-auto p-6 max-w-6xl font-sans bg-gray-50 min-h-screen">
      {/* Hotel Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-indigo-700">{hotel.name}</h1>
        <p className="text-gray-700">{hotel.vicinity}</p>
      </div>

      {/* Hotel Photos */}
      {hotel.photos && hotel.photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {hotel.photos.map((photo, i) => (
            <img
              key={i}
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`}
              alt={`${hotel.name} photo ${i + 1}`}
              className="rounded shadow object-cover w-full h-48"
            />
          ))}
        </div>
      )}

      {/* Amenities */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Amenities</h2>
        <div className="flex flex-wrap gap-4">
          {hotel.types?.length ? (
            hotel.types
              .filter((type) => amenitiesMap[type])
              .map((type) => (
                <div
                  key={type}
                  className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded shadow-sm"
                >
                  <span className="text-lg">{amenitiesMap[type].icon}</span>
                  <span className="font-medium">{amenitiesMap[type].label}</span>
                </div>
              ))
          ) : (
            <p className="text-gray-500">No amenities information available.</p>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">About the Hotel</h2>
        <p className="text-gray-700">
          {hotel.description || 'No description available for this hotel.'}
        </p>
      </section>

      {/* Booking Form */}
      <section className="mb-12">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-indigo-700 text-center">
            Book This Hotel
          </h2>

          {bookingError && (
            <p className="text-red-600 mb-4 font-semibold text-center">{bookingError}</p>
          )}

          <form onSubmit={handleBooking} className="flex flex-col space-y-4">
            <label className="flex flex-col">
              Check-in Date:
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </label>

            <label className="flex flex-col">
              Check-out Date:
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
            </label>

            <button
              type="submit"
              disabled={bookingLoading}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition text-lg"
            >
              {bookingLoading ? 'Processing...' : 'Book Now'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
