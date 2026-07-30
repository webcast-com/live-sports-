import { RequestHandler } from 'express';

export const handleBetigoloHistory: RequestHandler = async (req, res) => {
  const host = process.env.RAPIDAPI_HOST || 'betigolo-tips.p.rapidapi.com';
  const url = `https://${host}/premium/history`;
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.error('❌ RAPIDAPI_KEY environment variable is not set');
    return res.status(500).json({
      error: 'API key not configured',
      details: 'RAPIDAPI_KEY environment variable is missing'
    });
  }

  const options = {
    method: 'GET' as const,
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host,
      'Content-Type': 'application/json',
    },
  };

  try {
    console.log('📡 Fetching Betigolo history...');
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Betigolo API error: ${response.status} ${response.statusText}`,
        errorText,
      );
      return res.status(response.status).json({
        error: `Failed to fetch history: ${response.statusText}`,
        status: response.status,
      });
    }

    const data = await response.json();

    console.log(
      `✅ Betigolo history fetched: ${Array.isArray(data) ? data.length : '?'} records`,
    );
    
    // Add caching headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minute cache
    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching betigolo history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
