import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export interface Favorite {
  id: string;
  place_id: string;
  name: string;
  vicinity?: string;
  photo_ref?: string;
  created_at: string;
}

export interface AddFavoritePayload {
  place_id: string;
  name: string;
  vicinity?: string;
  photo_ref?: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Fetch user favorites from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from<Favorite>('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      if (data) setFavorites(data);
    };

    fetchFavorites();
  }, [user]);

  // Add a favorite
  const addFavorite = useCallback(
    async (fav: AddFavoritePayload) => {
      if (!user) return;

      const { data, error } = await supabase
        .from<Favorite>('favorites')
        .insert([
          {
            user_id: user.id,
            place_id: fav.place_id,
            name: fav.name,
            vicinity: fav.vicinity,
            photo_ref: fav.photo_ref,
          },
        ])
        .select();

      if (error) {
        console.error('Error adding favorite:', error);
        return;
      }

      if (data) setFavorites((prev) => [data[0], ...prev]);
    },
    [user]
  );

  // Remove a favorite
  const removeFavorite = useCallback(
    async (place_id: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', place_id);

      if (error) {
        console.error('Error removing favorite:', error);
        return;
      }

      setFavorites((prev) => prev.filter((f) => f.place_id !== place_id));
    },
    [user]
  );

  // Check if a place is favorite
  const isFavorite = useCallback(
    (place_id: string) => favorites.some((f) => f.place_id === place_id),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
};

