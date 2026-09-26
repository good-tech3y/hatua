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
              'You turn a personal goal into 5 to 7 short quest milestones for a game. Each quest is a concrete checkpoint the player reaches through their own real-world effort, ordered from earliest to hardest. Never explain how to do the goal, never give instructions, tips, or teaching content, only name the milestone in a few plain words, like a level title. Respond only with JSON: {"quests": ["...", ...]}',
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
    res.status(200).json({ quests });
  } catch (e: any) {
    res.status(500).json({ error: 'Unexpected server error', detail: String(e).slice(0, 300) });
  }
}
