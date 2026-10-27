export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mood = typeof req.body?.mood === 'string' ? req.body.mood.trim() : '';
  if (!mood || mood.length > 500) {
    return res.status(400).json({ error: 'Please provide a mood (up to 500 characters).' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Mood Matcher is not configured. Add GEMINI_API_KEY in deployment settings.' });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
        encodeURIComponent(process.env.GEMINI_API_KEY),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Suggest exactly ONE real movie title for this mood: "${mood}". Return only the title as plain text, no quotes and no explanation.`
            }]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 40 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: 'The movie suggestion service returned an error.' });
    }

    const title = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim()
      .replace(/^["'“”]+|["'“”]+$/g, '')
      .split('\n')[0]
      .trim();

    if (!title) return res.status(502).json({ error: 'No movie title was returned. Please try again.' });
    return res.status(200).json({ title });
  } catch {
    return res.status(500).json({ error: 'Could not contact the movie suggestion service.' });
  }
}
