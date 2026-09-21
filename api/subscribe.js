export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) {
    console.error('BEEHIIV_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const PUB_ID = 'pub_5d2f1b2e-5e0e-4225-b5ad-3ee5f90f9644';

  try {
    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'website',
          utm_medium: 'organic',
        }),
      }
    );

    const data = await beehiivRes.json();

    if (beehiivRes.ok) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Beehiiv API error:', beehiivRes.status, data);
      return res.status(beehiivRes.status).json({ error: data.message || 'Subscription failed' });
    }
  } catch (err) {
    console.error('Fetch to Beehiiv failed:', err);
    return res.status(500).json({ error: 'Network error reaching Beehiiv' });
  }
}

