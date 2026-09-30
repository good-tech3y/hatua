export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

  try {
    const { goal } = req.body || {};
    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      res.status(400).json({ error: 'goal is required' });
      return;
    }
    const key = process.env.GROQ_API_KEY;
    if (!key) { res.status(500).json({ error: 'Server is missing GROQ_API_KEY' }); return; }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.6,
        max_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You turn a personal goal into 5 to 7 short quest milestones for a game, and judge whether the goal is realistic for an ordinary person within its stated timeframe. Each quest is a concrete checkpoint reached through the player\'s own real-world effort, ordered earliest to hardest. Never give instructions or advice. Set photoRequired true only for goals best proven visually; false for private or non-visible habits. Set realistic false only when the goal scale or timeframe is clearly extreme; provide a kind, brief note suggesting a sustainable adjustment. Respond only with JSON: {"quests": ["...", ...], "photoRequired": true|false, "realistic": true|false, "note": "..."}.',
          },
          { role: 'user', content: `Goal: ${goal.trim().slice(0, 200)}` },
        ],
      }),
    });

    if (!groqRes.ok) {
      const t = await groqRes.text();
      res.status(502).json({ error: 'AI provider error', detail: t.slice(0, 300) });
      return;
    }
    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const quests = Array.isArray(parsed.quests)
      ? parsed.quests.filter((q: any) => typeof q === 'string').slice(0, 7)
      : [];
    if (quests.length < 3) { res.status(502).json({ error: 'AI returned too few quests' }); return; }
    res.status(200).json({
      quests,
      photoRequired: !!parsed.photoRequired,
      realistic: parsed.realistic !== false,
      note: typeof parsed.note === 'string' ? parsed.note.slice(0, 220) : '',
    });
  } catch (e: any) {
    res.status(500).json({ error: 'Unexpected server error', detail: String(e).slice(0, 300) });
  }
}
