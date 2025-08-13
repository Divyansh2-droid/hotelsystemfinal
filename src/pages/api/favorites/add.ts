import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, placeId, name, vicinity, photoRef } = req.body;

  if (!userId || !placeId || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, place_id: placeId, name, vicinity, photo_ref: photoRef }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ success: true, favorite: data[0] });
}
