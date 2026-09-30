const http = require('http');
const PORT = process.env.PORT || 8788;
const KEY = process.env.GROQ_API_KEY;
const TEXT_MODEL = 'openai/gpt-oss-120b';
const VISION_MODEL = 'qwen/qwen3.8-27b';

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

async function callGroq(model, messages, temperature, max_tokens) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, temperature, max_tokens, response_format: { type: 'json_object' }, messages }),
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
      const parsed = await callGroq(TEXT_MODEL, [
        {
          role: 'system',
          content:
            'You turn a personal goal into 5 to 7 short quest milestones for a game, and you judge the goal itself. ' +
            'Each quest is a concrete checkpoint reached through the player\'s own real-world effort, ordered earliest to hardest. ' +
            'Never explain how to do the goal, never give instructions, tips, or teaching content, only name the milestone in a few plain words, like a level title. ' +
            'Also decide photoRequired: true only if this goal is the kind best proven with a photo, a visible physical activity, something made or built, a visible change. False for goals that are honestly self-reported by nature, reading, habits, saving, mental or emotional goals, quiet daily practices. ' +
            'Also decide realistic: false only if the goal\'s scale is clearly extreme for an ordinary person in the time implied, and if so give a short, kind note suggesting a more sustainable version, never preachy or discouraging. ' +
            'Respond only with JSON: {"quests": ["...", ...], "photoRequired": true|false, "realistic": true|false, "note": "..."}. Omit note or leave it empty when realistic is true.',
        },
        { role: 'user', content: `Goal: ${goal.trim().slice(0, 200)}` },
      ], 0.5, 400);
      const quests = Array.isArray(parsed.quests) ? parsed.quests.filter((q) => typeof q === 'string').slice(0, 7) : [];
      if (quests.length < 3) { send(res, 502, { error: 'AI returned too few quests' }); return; }
      send(res, 200, {
        quests,
        photoRequired: !!parsed.photoRequired,
        realistic: parsed.realistic !== false,
        note: typeof parsed.note === 'string' ? parsed.note.slice(0, 220) : '',
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/judge') {
      const { goal, quest, text, recent, photoBase64, photoRequired, stepsRemaining } = await readBody(req);
      if (!text || text.trim().length < 2) { send(res, 400, { error: 'text is required' }); return; }
      if (photoRequired && !photoBase64) {
        send(res, 200, { verdict: 'none', score: 0, stepsEarned: 0, reason: 'This goal needs a quick photo to count. Attach one and try again.' });
        return;
      }
      const recentList = Array.isArray(recent) ? recent.slice(0, 3) : [];
      const recentBlock = recentList.length
        ? `Their last few check-ins, most recent first:\n${recentList.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
        : 'They have no earlier check-ins yet.';
      const maxSteps = photoBase64 ? Math.max(1, Number(stepsRemaining) || 1) : 1;
      const userText = `Goal: ${String(goal ?? '').slice(0, 200)}\nCurrent quest: ${String(quest ?? '').slice(0, 120)}\n${recentBlock}\n\nToday's check-in: ${text.trim().slice(0, 500)}`;

      let parsed;
      if (photoBase64) {
        parsed = await callGroq(VISION_MODEL, [
          {
            role: 'system',
            content:
              'You are an honest game judge inside a goal-tracking app. Inspect the actual image and the text together; the image is evidence, not decoration. Check that it visibly supports the claimed activity and scale. ' +
              'A normal day is worth 1 progress unit. Award multiple units, up to the stated remaining-path maximum, only when the image and text clearly prove a larger jump. ' +
              'If the photo does not match the claim, looks unrelated, or the text is vague even with a photo, do not reward it. Never explain how to do their goal or give advice, only judge what they reported and showed. ' +
              `The most this check-in can be worth is ${maxSteps} steps. ` +
              'Respond only with JSON: {"verdict": "progress"|"steady"|"none", "score": 0-100, "stepsEarned": integer from 0 to the maximum given, "reason": "one short, warm, direct sentence, mention the photo if it mattered"}.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photoBase64}` } },
            ],
          },
        ], 0.3, 300);
      } else {
        parsed = await callGroq(TEXT_MODEL, [
          {
            role: 'system',
            content:
              'You are an honest game judge inside a goal-tracking app. A player sends a short daily check-in about what they actually did. Decide if it shows plausible, specific real progress, or if it is vague, exaggerated, copy-pasted, or unbelievable. Text alone is never proof. ' +
              'Reject extraordinary daily claims without evidence: for example, running 100 km in one day must receive verdict none and stepsEarned 0, even if the sentence is specific. Judge claims against ordinary human limits and the goal timeframe. ' +
              'Compare it against their recent check-ins; do not reward a repeat of the same vague claim. Never explain how to do their goal or give advice, only judge what they reported. ' +
              'Respond only with JSON: {"verdict": "progress"|"steady"|"none", "score": 0-100, "stepsEarned": 0 or 1, "reason": "one short, warm, direct sentence"}. Award 1 only for plausible progress. Never award a large jump without visual proof.',
          },
          { role: 'user', content: userText },
        ], 0.3, 250);
      }

      const verdict = ['progress', 'steady', 'none'].includes(parsed.verdict) ? parsed.verdict : 'none';
      const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
      const stepsEarned = verdict === 'progress' ? Math.max(0, Math.min(maxSteps, Math.round(Number(parsed.stepsEarned) || 0))) : 0;
      const reason = typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim().slice(0, 220) : 'I could not read that clearly. Try describing it a little differently.';
      send(res, 200, { verdict, score, stepsEarned, reason });
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch (e) {
    send(res, 500, { error: 'Unexpected server error', detail: String(e).slice(0, 300) });
  }
});
server.listen(PORT, () => console.log(`AI server on :${PORT}`));
