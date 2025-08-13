import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromRequest } from '@/lib/authHelpers'; // optional helper if you have auth middleware

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req); // Or get from your auth context/session
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { place_id, name, vicinity, photo_ref } = req.body;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase.from('favorites').insert([
        {
          user_id: user.id,
          place_id,
          name,
          vicinity,
          photo_ref,
        },
      ]);
      if (error) throw error;
      return res.status(200).json(data[0]);
    }

    if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', place_id);
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
