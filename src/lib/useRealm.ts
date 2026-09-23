import { useAccess } from './access';
import { REALMS } from './realms';
import type { RealmId } from './realms';
import { useStore } from './store';

export function useRealm(): RealmId {
  const realm = useStore((s) => s.realm);
  const { unlocked } = useAccess();
  return REALMS[realm]?.pro && !unlocked ? 'meadow' : realm;
}
