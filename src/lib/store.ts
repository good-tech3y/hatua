import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CheckIn, Goal } from './game';
import { QUEST_DAYS, clamp, healthDelta } from './game';
import type { RealmId, SkinId } from './realms';

type State = {
  goal: Goal | null; checkIns: CheckIn[]; xp: number; health: number; pro: boolean;
  realm: RealmId; skin: SkinId; name: string; installedAt: number | null;
  startGoal: (text: string, titles: string[], photoRequired?: boolean) => void;
  addCheckIn: (c: CheckIn) => void;
  setPro: (pro: boolean) => void;
  setRealm: (realm: RealmId) => void;
  setSkin: (skin: SkinId) => void;
  setName: (name: string) => void;
  setInstalledAt: (t: number) => void;
  resetAll: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      goal: null, checkIns: [], xp: 0, health: 60, pro: false,
      realm: 'meadow', skin: 'mint', name: '', installedAt: null,
      startGoal: (text, titles, photoRequired = false) =>
        set({
          goal: {
            text,
            createdAt: Date.now(),
            photoRequired,
            quests: titles.slice(0, 7).map((title, i) => ({ id: `q${i}`, title, need: QUEST_DAYS, done: 0 })),
          },
          checkIns: [], xp: 0, health: 60,
        }),
      addCheckIn: (c) =>
        set((s) => {
          let quests = s.goal?.quests ?? [];
          let stepsRemaining = c.verdict === 'progress' ? Math.max(1, c.steps ?? 1) : 0;
          const completedQuestTitles: string[] = [];
          if (c.verdict === 'progress') {
            quests = quests.map((q) => {
              const earned = Math.min(stepsRemaining, Math.max(0, q.need - q.done));
              stepsRemaining -= earned;
              const done = q.done + earned;
              if (q.done < q.need && done >= q.need) completedQuestTitles.push(q.title);
              return earned ? { ...q, done } : q;
            });
          }
          const goalFinished = quests.length > 0 && quests.every((q) => q.done >= q.need);
          return {
            goal: s.goal ? { ...s.goal, quests, ...(goalFinished ? { completedAt: Date.now() } : {}) } : s.goal,
            checkIns: [{ ...c, completedQuestTitles }, ...s.checkIns],
            xp: s.xp + c.xp,
            health: clamp(s.health + healthDelta(c.verdict)),
          };
        }),
      setPro: (pro) => set({ pro }),
      setRealm: (realm) => set({ realm }),
      setSkin: (skin) => set({ skin }),
      setName: (name) => set({ name: name.slice(0, 24) }),
      setInstalledAt: (t) => set((s) => (s.installedAt ? s : { installedAt: t })),
      resetAll: () => set({ goal: null, checkIns: [], xp: 0, health: 60 }),
    }),
    { name: 'hatua-state', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function useHydrated() {
  const [ready, setReady] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setReady(true));
    setReady(useStore.persist.hasHydrated());
    return unsub;
  }, []);
  return ready;
}
