import { useCallback, useEffect, useState } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useStore } from './store';

// Set EXPO_PUBLIC_RC_KEY in .env. Without it the app runs Pro in demo mode.
const KEY = process.env.EXPO_PUBLIC_RC_KEY;
export const hasKey = !!KEY;
export const isTestKey = !!KEY && KEY.startsWith('test_');

let configured = false;

function init() {
  if (configured || !KEY) return;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: KEY });
  configured = true;
}

const isActive = (info: CustomerInfo) => Object.keys(info.entitlements.active).length > 0;
const ORDER = ['ANNUAL', 'MONTHLY', 'LIFETIME'];

// Keeps the saved Pro flag in step with RevenueCat.
export function useProSync() {
  const setPro = useStore((s) => s.setPro);
  useEffect(() => {
    if (!hasKey) return;
    init();
    const onInfo = (info: CustomerInfo) => setPro(isActive(info));
    Purchases.getCustomerInfo()
      .then(onInfo)
      .catch(() => {});
    Purchases.addCustomerInfoUpdateListener(onInfo);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(onInfo);
    };
  }, [setPro]);
}

export function ProSync() {
  useProSync();
  return null;
}

export function usePro() {
  useProSync();
  const pro = useStore((s) => s.pro);
  const setPro = useStore((s) => s.setPro);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(hasKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasKey) return;
    init();
    Purchases.getOfferings()
      .then((o) => {
        const list = o.current?.availablePackages ?? [];
        setPackages(
          [...list].sort((a, b) => ORDER.indexOf(a.packageType) - ORDER.indexOf(b.packageType)),
        );
      })
      .catch(() => setError('Could not load the plans. Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const buy = useCallback(
    async (pkg: PurchasesPackage) => {
      setBusy(true);
      setError('');
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const ok = isActive(customerInfo);
        setPro(ok);
        return ok;
      } catch (e) {
        const err = e as { userCancelled?: boolean };
        if (!err.userCancelled) setError('That purchase did not go through. Please try again.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [setPro],
  );

  const restore = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const info = await Purchases.restorePurchases();
      const ok = isActive(info);
      setPro(ok);
      if (!ok) setError('No earlier purchase was found for this account.');
      return ok;
    } catch {
      setError('Could not restore right now. Try again in a moment.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [setPro]);

  return { pro, packages, loading, busy, error, demo: !hasKey, buy, restore, demoSet: setPro };
}
