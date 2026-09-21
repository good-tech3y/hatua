import type { JudgeResult } from './game';

// Set EXPO_PUBLIC_AI_URL in .env to use the real judge. Without it the app runs in demo mode.
const BASE = process.env.EXPO_PUBLIC_AI_URL;
export const isDemo = !BASE;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function post<T>(path: string, body: unknown): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Request failed with ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const DEMO_QUESTS = [
  'Take the first step',
  'Build a small rhythm',
  'Show up on a hard day',
  'Stretch a little further',
  'Make your progress visible',
  'Cross the finish line',
];

const VAGUE =
  /\b(worked on it|did some|did stuff|did things|tried|a bit|a little|kind of|sort of|nothing much|not much|as usual|for a while|stuff)\b/i;
const UNITS =
  /\b(min|mins|minutes|hour|hours|hr|hrs|page|pages|km|mile|miles|rep|reps|set|sets|word|words|line|lines|call|calls|session|sessions|times|chapter|chapters|lap|laps|question|questions|problem|problems|email|emails)\b/i;
const DONE =
  /\b(finished|completed|wrote|written|ran|read|built|practiced|practised|called|cooked|cleaned|studied|sent|submitted|walked|lifted|saved|fixed|shipped|drew|recorded|solved|booked|paid|launched|posted|made)\b/i;

const words = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

function similarity(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  A.forEach((w) => {
    if (B.has(w)) shared += 1;
  });
  return shared / (A.size + B.size - shared);
}

// A simple offline stand-in for the real judge. It only checks how specific a check-in is.
export function demoJudge(text: string, recent: string[]): JudgeResult {
  const w = words(text);
  let score = Math.min(w.length, 30) * 1.6;
  if (/\d/.test(text)) score += 18;
  if (UNITS.test(text)) score += 14;
  if (DONE.test(text)) score += 14;
  if (VAGUE.test(text)) score -= 22;
  const repeated = recent.slice(0, 3).some((r) => similarity(w, words(r)) > 0.7);
  if (repeated) score -= 45;
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (repeated) {
    return {
      verdict: 'none',
      score,
      reason: 'This reads almost the same as a recent check-in. Tell me what is different today.',
    };
  }
  if (score >= 50) {
    return {
      verdict: 'progress',
      score,
      reason: 'That counts. You gave me something specific: what you did and how much of it.',
    };
  }
  if (score >= 26) {
    return {
      verdict: 'steady',
      score,
      reason:
        'That sounds like effort, but I cannot see what changed. Add one concrete detail, like how long or how many.',
    };
  }
  return {
    verdict: 'none',
    score,
    reason: 'That is too vague for me to count. Tell me what you actually did and how much.',
  };
}

export async function makeQuests(goal: string): Promise<string[]> {
  if (isDemo) {
    await wait(900);
    return DEMO_QUESTS;
  }
  const data = await post<{ quests?: string[] }>('/quests', { goal });
  if (!Array.isArray(data.quests) || data.quests.length < 3) throw new Error('Bad quests');
  return data.quests;
}

export async function judge(input: {
  goal: string;
  quest: string;
  text: string;
  recent: string[];
}): Promise<JudgeResult> {
  if (isDemo) {
    await wait(1100);
    return demoJudge(input.text, input.recent);
  }
  return post<JudgeResult>('/judge', input);
}
