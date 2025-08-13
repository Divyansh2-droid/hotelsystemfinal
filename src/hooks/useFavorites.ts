import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  vicinity?: string;
  photo_ref?: string;
  created_at: string;
}

interface AddFavoritePayload {
  place_id: string;
  name: string;
  vicinity?: string;
  photo_ref?: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('favorites') // ⬅ removed <Favorite>
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setFavorites(data as Favorite[]);
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (fav: AddFavoritePayload) => {
    if (!user) return;
    const { data, error } = await supabase.from('favorites').insert([
      {
        user_id: user.id,
        place_id: fav.place_id,
        name: fav.name,
        vicinity: fav.vicinity,
        photo_ref: fav.photo_ref,
      },
    ]).select();

    if (!error && data) setFavorites((prev) => [data[0] as Favorite, ...prev]);
  };

  const removeFavorite = async (place_id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('place_id', place_id);

    if (!error) setFavorites((prev) => prev.filter((f) => f.place_id !== place_id));
  };

  const isFavorite = (place_id: string) =>
    favorites.some((f) => f.place_id === place_id);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
