import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, placeId } = req.body;

  if (!userId || !placeId) return res.status(400).json({ error: 'Missing required fields' });

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ success: true });
}
