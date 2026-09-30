export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }

  try {
    const { goal, quest, text, recent, photoBase64, photoRequired, stepsRemaining } = req.body || {};
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
    if (photoRequired && !photoBase64) {
      res.status(200).json({ verdict: 'none', score: 0, stepsEarned: 0, reason: 'This goal needs a photo to count. Attach one and try again.' });
      return;
    }
    const maxSteps = photoBase64 ? Math.max(1, Number(stepsRemaining) || 1) : 1;
    const userText = `Goal: ${String(goal ?? '').slice(0, 200)}\nCurrent quest: ${String(quest ?? '').slice(0, 120)}\n${recentBlock}\n\nToday's check-in: ${text.trim().slice(0, 500)}`;
    const system = photoBase64
      ? 'You are an honest goal-tracking judge. Inspect the actual image and text together; the image is evidence, not decoration. Check that it visibly supports the claimed activity and scale. A normal day earns 1 progress unit. Award multiple units only when the image clearly proves that larger jump. If required proof is unrelated or insufficient, return none and 0 steps. Never give advice. Respond only JSON: {"verdict":"progress"|"steady"|"none","score":0-100,"stepsEarned":integer 0 to the given maximum,"reason":"one short direct sentence"}.'
      : 'You are an honest goal-tracking judge. Judge plausibility against ordinary human limits, the goal, current milestone, and timeframe. Text is not proof. Reject extraordinary daily claims without evidence; for example, running 100 km in one day must be none with 0 steps, even when stated specifically. Compare recent check-ins and do not reward repeats. Never give advice. Respond only JSON: {"verdict":"progress"|"steady"|"none","score":0-100,"stepsEarned":0 or 1,"reason":"one short direct sentence"}. Award 1 only for plausible progress.';

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: photoBase64 ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-120b',
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${system} Maximum steps for this check-in: ${maxSteps}.` },
          {
            role: 'user',
            content: photoBase64
              ? [
                  { type: 'text', text: userText },
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photoBase64}` } },
                ]
              : userText,
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
    const stepsEarned = verdict === 'progress' ? Math.max(0, Math.min(maxSteps, Math.round(Number(parsed.stepsEarned) || 0))) : 0;
    const reason =
      typeof parsed.reason === 'string' && parsed.reason.trim()
        ? parsed.reason.trim().slice(0, 220)
        : 'I could not read that clearly. Try describing it a little differently.';
    res.status(200).json({ verdict, score, stepsEarned, reason });
  } catch (e: any) {
    res.status(500).json({ error: 'Unexpected server error', detail: String(e).slice(0, 300) });
  }
}
