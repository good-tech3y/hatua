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
    blurb: 'Soft sky where everyone starts.',
    pro: false,
    stops: [colors.skyDeep, colors.sky, colors.skyMist],
  },
  lagoon: {
    name: 'Lagoon',
    blurb: 'Cool, clear water.',
    pro: true,
    stops: [colors.teal, colors.blueSoft, colors.sky],
  },
  dawn: {
    name: 'Dawn',
    blurb: 'Peach and lilac light.',
    pro: true,
    stops: [colors.peach, colors.paper, colors.lilacGlow],
  },
  dusk: {
    name: 'Dusk',
    blurb: 'Quiet evening tones.',
    pro: true,
    stops: ['#CDB6C2', '#C5BDD6', colors.periwinkle],
  },
};

export const SKINS: Record<SkinId, { name: string; scarf: string; pro: boolean }> = {
  mint: { name: 'Mint', scarf: colors.mint, pro: false },
  lemon: { name: 'Lemon', scarf: colors.lemon, pro: true },
  violet: { name: 'Violet', scarf: colors.violet, pro: true },
  cobalt: { name: 'Cobalt', scarf: colors.cobalt, pro: true },
};
