'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import Image from 'next/image';
import Link from 'next/link';

interface Place {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  photo_ref?: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const res = await fetch('/api/nearby-places');
        const data: Place[] = await res.json();
        setPlaces(data);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  const isFavorite = (placeId: string) =>
    favorites.some((fav) => fav.place_id === placeId);

  if (loading) {
    return (
      <div className="p-6 text-center text-lg text-gray-500">
        Loading nearby places...
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {places.map((place) => (
        <div key={place.place_id} className="bg-white rounded-lg shadow p-4 flex flex-col">
          {place.photo_ref ? (
            <Image
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photo_ref}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
              alt={place.name}
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
            <h3 className="text-lg font-semibold">{place.name}</h3>
            {place.vicinity && (
              <p className="text-gray-500 text-sm">{place.vicinity}</p>
            )}
            {place.rating && (
              <p className="text-yellow-500 text-sm">⭐ {place.rating}</p>
            )}
          </div>

          {user ? (
            <button
              onClick={() =>
                isFavorite(place.place_id)
                  ? removeFavorite(place.place_id)
                  : addFavorite({
                      place_id: place.place_id,
                      name: place.name,
                      vicinity: place.vicinity || '',
                      photo_ref: place.photo_ref || '',
                    })
              }
              className={`mt-4 py-2 px-4 rounded-md text-white ${
                isFavorite(place.place_id)
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isFavorite(place.place_id) ? 'Remove Favorite' : 'Add to Favorites'}
            </button>
          ) : (
            <Link
              href="/login"
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-center"
            >
              Log in to favorite
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
