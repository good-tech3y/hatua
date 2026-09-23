// Colors were sampled or rounded from the three reference images:
// the glass app screen, the landing page and the dark onboarding screen.
export const colors = {
  ink: '#0F0F10',
  pill: '#1E1E1E',
  navy: '#0A2232',
  cobalt: '#1A67B0',
  muted: '#9E9A90',
  bodyMuted: '#4F4A42',

  skyDeep: '#B0BFDF',
  sky: '#D8E6F7',
  skyMist: '#D7E7F6',
  teal: '#91B8CB',
  blueSoft: '#A9C5E1',
  periwinkle: '#C3D0F7',
  mint: '#83C6B9',
  mintDeep: '#538377',
  lemon: '#F8FFA0',
  card: '#FCFEFF',
  slate: '#506476',
  slateSoft: '#617587',

  paper: '#FFFFFF',
  mist: '#F0F0F0',
  peach: '#FBEDD1',
  lilacGlow: '#F0D7F7',
  violet: '#8F4CD6',
  violetSoft: '#BD91EA',

  night: '#0B0B0B',
  white: '#FFFFFF',
  terracotta: '#C97455',
  moss: '#4B6B4A',
  plum: '#6B4361',
  denim: '#3E5C78',
} as const;

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 38, lineHeight: 44, letterSpacing: -0.8 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} as const;

export const radii = { card: 28, pill: 999, chip: 999 } as const;

export const shadow = {
  soft: {
    shadowColor: '#4A6C94',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
} as const;
