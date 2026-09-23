import { useEffect } from 'react';
import { useStore } from './store';

export const TRIAL_DAYS = 30;
const DAY_MS = 86400000;

// Every new player gets 30 days of everything unlocked, tracked from first open, no purchase needed.
export function useAccess() {
  const pro = useStore((s) => s.pro);
  const installedAt = useStore((s) => s.installedAt);
  const setInstalledAt = useStore((s) => s.setInstalledAt);

  useEffect(() => {
    if (!installedAt) setInstalledAt(Date.now());
  }, [installedAt, setInstalledAt]);

  const start = installedAt ?? Date.now();
  const elapsed = (Date.now() - start) / DAY_MS;
  const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
  const trialActive = !pro && daysLeft > 0;

  return { unlocked: pro || trialActive, pro, trialActive, daysLeft };
}
