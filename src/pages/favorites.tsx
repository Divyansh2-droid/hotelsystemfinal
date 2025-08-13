import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface Favorite {
  id: string;
  place_id: string;
  name: string;
  vicinity?: string;
  photo_ref?: string;
  created_at: string;
}

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    supabase
      .from<Favorite, Favorite>('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setFavorites(data);
        setLoading(false);
      });
  }, [user]);

  const removeFavorite = async (id: string) => {
    const confirmDelete = window.confirm('Remove this hotel from favorites?');
    if (!confirmDelete) return;

    await supabase.from<Favorite, Favorite>('favorites').delete().eq('id', id);
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium text-gray-700">
          Please login to view your favorites.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Your Favorites
        </h1>

        {loading && (
          <p className="text-center text-lg text-gray-600">Loading favorites...</p>
        )}

        {!loading && favorites.length === 0 && (
          <p className="text-center text-gray-500 text-lg mt-10">
            You have no favorite hotels yet.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition transform hover:scale-105"
            >
              {fav.photo_ref ? (
                <div className="relative w-full h-48">
                  <Image
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${fav.photo_ref}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`}
                    alt={fav.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  No Image Available
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 truncate">
                    {fav.name}
                  </h2>
                  {fav.vicinity && (
                    <p className="text-gray-600 text-sm mt-1">{fav.vicinity}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Added on: {new Date(fav.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold text-sm transition"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() =>
                      window.location.href = `/hotel/${fav.place_id}`
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded font-semibold text-sm transition"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
