import type { CheckIn, Goal } from './game';
import { levelOf, streakDays } from './game';

export type Achievement = { id: string; title: string; note: string; done: boolean };

type Snapshot = { checkIns: CheckIn[]; xp: number; goal: Goal | null };

// Everything here is worked out from your real check-ins. Nothing is handed out.
export function achievements(s: Snapshot): Achievement[] {
  const wins = s.checkIns.filter((c) => c.verdict === 'progress');
  const days = new Set(wins.map((c) => c.day)).size;
  const streak = streakDays(s.checkIns);
  const level = levelOf(s.xp);
  const quests = s.goal?.quests ?? [];
  const finished = quests.filter((q) => q.done >= q.need).length;
  const retry = wins.some((w) =>
    s.checkIns.some((o) => o.day === w.day && o.verdict !== 'progress' && o.at < w.at),
  );
  return [
    { id: 'first', title: 'First honest step', note: 'Get your first check-in counted.', done: wins.length >= 1 },
    { id: 'retry', title: 'Second try counts', note: 'Say it again with more detail and earn it.', done: retry },
    { id: 'streak3', title: 'Three in a row', note: 'Move forward three days in a row.', done: streak >= 3 },
    { id: 'streak7', title: 'A whole week', note: 'Move forward seven days in a row.', done: streak >= 7 },
    { id: 'days10', title: 'Ten real days', note: 'Ten days where something truly changed.', done: days >= 10 },
    { id: 'lvl3', title: 'Level 3', note: 'Grow your hero to level 3.', done: level >= 3 },
    { id: 'lvl5', title: 'Level 5', note: 'Grow your hero to level 5.', done: level >= 5 },
    { id: 'quest1', title: 'First lantern', note: 'Finish your first quest.', done: finished >= 1 },
    { id: 'half', title: 'Halfway there', note: 'Finish half of your quests.', done: quests.length > 0 && finished * 2 >= quests.length },
    { id: 'goal', title: 'You made it', note: 'Finish every quest on your path.', done: quests.length > 0 && finished === quests.length },
  ];
}
