import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { place_id } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!place_id || typeof place_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid place_id' });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id,
          fields: 'name,rating,formatted_address,photos,types',
          key: apiKey,
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
