import { REALMS } from './realms';
import type { RealmId } from './realms';
import { useStore } from './store';

// The realm on screen. A Pro realm falls back to Meadow when Pro is off.
export function useRealm(): RealmId {
  const realm = useStore((s) => s.realm);
  const pro = useStore((s) => s.pro);
  return REALMS[realm]?.pro && !pro ? 'meadow' : realm;
}
