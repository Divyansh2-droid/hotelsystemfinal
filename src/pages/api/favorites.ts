import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromRequest } from '@/lib/authHelpers';

type FavoriteBody = {
  place_id: string;
  name: string;
  vicinity: string;
  photo_ref?: string;
};

type Favorite = {
  user_id: string;
  place_id: string;
  name: string;
  vicinity: string;
  photo_ref?: string;
  created_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = req.body as FavoriteBody;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('favorites')          // Only table name here
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data as Favorite[]);
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('favorites')
        .insert([
          {
            user_id: user.id,
            place_id: body.place_id,
            name: body.name,
            vicinity: body.vicinity,
            photo_ref: body.photo_ref || null,
          },
        ]);

      if (error) throw error;
      return res.status(200).json((data as Favorite[])[0]);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', body.place_id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
