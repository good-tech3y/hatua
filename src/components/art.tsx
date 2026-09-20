import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../theme';

export function HatuaMark({
  size = 28,
  color = colors.cobalt,
  dot = colors.lemon,
}: {
  size?: number;
  color?: string;
  dot?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M7 41 H18 V31 H28 V21 H35"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={39.5} cy={9} r={4.5} fill={dot} stroke={color} strokeWidth={3} />
    </Svg>
  );
}

export function HeroFigure({
  size = 96,
  ink = colors.navy,
  scarf = colors.mint,
  face = colors.card,
}: {
  size?: number;
  ink?: string;
  scarf?: string;
  face?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Path
        d="M45 36 C37 31 29 40 18 35"
        stroke={scarf}
        strokeWidth={4.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M45 38 C39 42 33 46 24 46"
        stroke={scarf}
        strokeWidth={4.6}
        strokeLinecap="round"
        fill="none"
      />
      <G stroke={ink} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M48 32 L48 60" />
        <Path d="M48 43 L33 54" />
        <Path d="M48 43 L64 32" />
        <Path d="M48 60 L37 83 L30 83" />
        <Path d="M48 60 L60 82 L67 82" />
        <Circle cx={48} cy={21} r={10.5} fill={face} />
      </G>
      <Path d="M43 34 H53" stroke={scarf} strokeWidth={5.2} strokeLinecap="round" />
    </Svg>
  );
}
