'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">
          Please <Link href="/login" className="text-blue-500 underline">log in</Link> to view your favorites.
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">You have no favorite places yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {favorites.map((fav) => (
        <div key={fav.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
          {fav.photo_ref ? (
            <Image
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${fav.photo_ref}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
              alt={fav.name}
              width={400}
              height={250}
              className="rounded-md object-cover w-full h-48"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md text-gray-500">
              No Image
            </div>
          )}
          <div className="mt-3 flex-1">
            <h3 className="text-lg font-semibold">{fav.name}</h3>
            {fav.vicinity && (
              <p className="text-gray-500 text-sm">{fav.vicinity}</p>
            )}
          </div>
          <button
            onClick={() => removeFavorite(fav.place_id)}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
