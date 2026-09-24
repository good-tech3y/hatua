export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

  try {
    const { goal, quest, text, recent } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length < 2) {
      res.status(400).json({ error: 'text is required' });
      return;
    }
    const key = process.env.GROQ_API_KEY;
    if (!key) { res.status(500).json({ error: 'Server is missing GROQ_API_KEY' }); return; }

    const recentList = Array.isArray(recent) ? recent.slice(0, 3) : [];
    const recentBlock = recentList.length
      ? `Their last few check-ins, most recent first:\n${recentList.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}`
      : 'They have no earlier check-ins yet.';

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 250,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are an honest game judge inside a goal-tracking app. A player sends a short daily check-in about what they actually did. Decide if it shows genuine, specific, real progress worth rewarding, or if it is vague, generic, exaggerated, copy-pasted, or clearly not real. Compare it against their recent check-ins; do not reward a repeat of the same vague claim. Never explain how to do their goal or give advice, only judge what they reported. Respond only with JSON: {"verdict": "progress" | "steady" | "none", "score": 0-100, "reason": "one short, warm, direct sentence to the player explaining the verdict"}. progress = specific and real. steady = plausible effort but not concrete enough to fully count. none = too vague, empty, or not believable.',
          },
          {
            role: 'user',
            content: `Goal: ${String(goal ?? '').slice(0, 200)}\nCurrent quest: ${String(quest ?? '').slice(0, 120)}\n${recentBlock}\n\nToday's check-in: ${text.trim().slice(0, 500)}`,
          },
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
    const verdict = ['progress', 'steady', 'none'].includes(parsed.verdict) ? parsed.verdict : 'none';
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
    const reason =
      typeof parsed.reason === 'string' && parsed.reason.trim()
        ? parsed.reason.trim().slice(0, 220)
        : 'I could not read that clearly. Try describing it a little differently.';
    res.status(200).json({ verdict, score, reason });
  } catch (e: any) {
    res.status(500).json({ error: 'Unexpected server error', detail: String(e).slice(0, 300) });
  }
}
