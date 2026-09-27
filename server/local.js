const http = require('http');
const PORT = process.env.PORT || 8788;
const KEY = process.env.GROQ_API_KEY;

function send(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

async function callGroq(messages, temperature, max_tokens) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature, max_tokens, response_format: { type: 'json_object' }, messages }),
  });
  if (!r.ok) throw new Error(`Groq error ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{}');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { send(res, 204, {}); return; }
  if (!KEY) { send(res, 500, { error: 'Missing GROQ_API_KEY' }); return; }
  try {
    if (req.method === 'POST' && req.url === '/quests') {
      const { goal } = await readBody(req);
      if (!goal || goal.trim().length < 3) { send(res, 400, { error: 'goal is required' }); return; }
      const parsed = await callGroq([
        { role: 'system', content: 'You turn a personal goal into 5 to 7 short quest milestones for a game. Each quest is a concrete checkpoint the player reaches through their own real-world effort, ordered from earliest to hardest. Never explain how to do the goal, never give instructions, tips, or teaching content, only name the milestone in a few plain words, like a level title. Respond only with JSON: {"quests": ["...", ...]}' },
        { role: 'user', content: `Goal: ${goal.trim().slice(0, 200)}` },
      ], 0.6, 300);
      const quests = Array.isArray(parsed.quests) ? parsed.quests.filter((q) => typeof q === 'string').slice(0, 7) : [];
      if (quests.length < 3) { send(res, 502, { error: 'AI returned too few quests' }); return; }
      send(res, 200, { quests });
      return;
    }
    if (req.method === 'POST' && req.url === '/judge') {
      const { goal, quest, text, recent } = await readBody(req);
      if (!text || text.trim().length < 2) { send(res, 400, { error: 'text is required' }); return; }
      const recentList = Array.isArray(recent) ? recent.slice(0, 3) : [];
      const recentBlock = recentList.length
        ? `Their last few check-ins, most recent first:\n${recentList.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
        : 'They have no earlier check-ins yet.';
      const parsed = await callGroq([
        { role: 'system', content: 'You are an honest game judge inside a goal-tracking app. A player sends a short daily check-in about what they actually did. Decide if it shows genuine, specific, real progress worth rewarding, or if it is vague, generic, exaggerated, copy-pasted, or clearly not real. Compare it against their recent check-ins; do not reward a repeat of the same vague claim. Never explain how to do their goal or give advice, only judge what they reported. Respond only with JSON: {"verdict": "progress" | "steady" | "none", "score": 0-100, "reason": "one short, warm, direct sentence to the player explaining the verdict"}. progress = specific and real. steady = plausible effort but not concrete enough to fully count. none = too vague, empty, or not believable.' },
        { role: 'user', content: `Goal: ${String(goal ?? '').slice(0, 200)}\nCurrent quest: ${String(quest ?? '').slice(0, 120)}\n${recentBlock}\n\nToday's check-in: ${text.trim().slice(0, 500)}` },
      ], 0.3, 250);
      const verdict = ['progress', 'steady', 'none'].includes(parsed.verdict) ? parsed.verdict : 'none';
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
      const reason = typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim().slice(0, 220) : 'I could not read that clearly. Try describing it a little differently.';
      send(res, 200, { verdict, score, reason });
      return;
    }
    send(res, 404, { error: 'Not found' });
  } catch (e) {
    send(res, 500, { error: 'Unexpected server error', detail: String(e).slice(0, 300) });
  }
});
server.listen(PORT, () => console.log(`AI server on :${PORT}`));
