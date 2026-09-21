export type Verdict = 'progress' | 'steady' | 'none';
export type Quest = { id: string; title: string; need: number; done: number };
export type Goal = { text: string; quests: Quest[]; createdAt: number };
export type JudgeResult = { verdict: Verdict; score: number; reason: string };
export type CheckIn = {
  id: string;
  at: number;
  day: string;
  text: string;
  verdict: Verdict;
  score: number;
  reason: string;
  xp: number;
};

export const QUEST_DAYS = 2;

export function dayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const levelOf = (xp: number) => Math.floor(xp / 100) + 1;
export const xpInLevel = (xp: number) => xp % 100;
export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function currentQuestIndex(quests: Quest[]) {
  const i = quests.findIndex((q) => q.done < q.need);
  return i === -1 ? quests.length : i;
}

export function journeyPercent(quests: Quest[]) {
  const need = quests.reduce((s, q) => s + q.need, 0);
  const done = quests.reduce((s, q) => s + q.done, 0);
  return need === 0 ? 0 : Math.round((100 * done) / need);
}

export function successRate(history: CheckIn[]) {
  if (history.length === 0) return 0;
  const good = history.filter((c) => c.verdict === 'progress').length;
  return Math.round((100 * good) / history.length);
}

export const healthDelta = (v: Verdict) => (v === 'progress' ? 8 : v === 'steady' ? 2 : -6);

// Turns the judge's raw answer into what the game actually applies.
export function settle(history: CheckIn[], raw: JudgeResult) {
  const movedToday = history.some((c) => c.day === dayKey() && c.verdict === 'progress');
  if (raw.verdict === 'progress' && movedToday) {
    return {
      verdict: 'steady' as Verdict,
      xp: 5,
      reason:
        'That is real, but you already moved forward today. One step of progress a day keeps this honest. See you tomorrow.',
    };
  }
  if (raw.verdict === 'progress') {
    return { verdict: 'progress' as Verdict, xp: Math.round(20 + raw.score * 0.4), reason: raw.reason };
  }
  if (raw.verdict === 'steady') return { verdict: 'steady' as Verdict, xp: 8, reason: raw.reason };
  return { verdict: 'none' as Verdict, xp: 0, reason: raw.reason };
}

// How many days in a row you moved forward. Today does not break the streak until it ends.
export function streakDays(history: CheckIn[]) {
  const days = new Set(history.filter((c) => c.verdict === 'progress').map((c) => c.day));
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
