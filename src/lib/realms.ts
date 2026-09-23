import { colors } from '../theme';

export type RealmId = 'meadow' | 'lagoon' | 'dawn' | 'dusk';
export type SkinId = 'mint' | 'lemon' | 'violet' | 'cobalt';

export const REALM_ORDER: RealmId[] = ['meadow', 'lagoon', 'dawn', 'dusk'];
export const SKIN_ORDER: SkinId[] = ['mint', 'lemon', 'violet', 'cobalt'];

export const REALMS: Record<
  RealmId,
  { name: string; blurb: string; pro: boolean; stops: [string, string, string] }
> = {
  meadow: {
    name: 'Meadow',
    blurb: 'Lanterns up a sunny hill.',
    pro: false,
    stops: [colors.skyDeep, colors.sky, colors.skyMist],
  },
  lagoon: {
    name: 'Lagoon',
    blurb: 'Stepping stones across the water.',
    pro: true,
    stops: [colors.teal, colors.blueSoft, colors.sky],
  },
  dawn: {
    name: 'Dawn',
    blurb: 'A hillside path to the sunrise.',
    pro: true,
    stops: [colors.peach, colors.paper, colors.lilacGlow],
  },
  dusk: {
    name: 'Dusk',
    blurb: 'A trail of stars after dark.',
    pro: true,
    stops: ['#CDB6C2', '#C5BDD6', colors.periwinkle],
  },
};

export const SKINS: Record<SkinId, { name: string; scarf: string; pro: boolean }> = {
  mint: { name: 'Terracotta', scarf: colors.terracotta, pro: false },
  lemon: { name: 'Moss', scarf: colors.moss, pro: true },
  violet: { name: 'Plum', scarf: colors.plum, pro: true },
  cobalt: { name: 'Denim', scarf: colors.denim, pro: true },
};
