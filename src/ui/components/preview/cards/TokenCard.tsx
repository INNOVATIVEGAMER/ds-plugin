import type { FlattenedToken } from '../../../types/ui';
import ColorCard from './ColorCard';
import SizeCard from './SizeCard';
import RadiusCard from './RadiusCard';
import BorderWidthCard from './BorderWidthCard';
import TypographyCard from './TypographyCard';
import ShadowCard from './ShadowCard';
import NumberCard from './NumberCard';
import FontFamilyCard from './FontFamilyCard';

interface TokenCardProps {
  token: FlattenedToken;
}

export default function TokenCard({ token }: TokenCardProps) {
  switch (token.type) {
    case 'color':
      return <ColorCard token={token} />;

    case 'size':
    case 'spacing':
      return <SizeCard token={token} />;

    case 'radius':
      return <RadiusCard token={token} />;

    case 'borderWidth':
      return <BorderWidthCard token={token} />;

    case 'typography':
      return <TypographyCard token={token} />;

    case 'shadow':
      return <ShadowCard token={token} />;

    case 'fontFamily':
      return <FontFamilyCard token={token} />;

    case 'fontWeight':
    case 'number':
    default:
      return <NumberCard token={token} />;
  }
}
