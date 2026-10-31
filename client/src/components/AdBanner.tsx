import { getGoogleAdSlot, GoogleAdSlot, type GoogleAdPlacement } from './GoogleAdSlot';

interface AdBannerProps {
  position?: 'sidebar' | 'footer' | 'subtle' | 'marketplace';
}

export function AdBanner({ position = 'subtle' }: AdBannerProps) {
  const placement: GoogleAdPlacement = position === 'subtle' ? 'editor' : position;
  if (!getGoogleAdSlot(placement)) return null;
  const width = placement === 'editor'
    ? 'w-[180px] max-w-full'
    : placement === 'footer'
      ? 'w-full max-w-3xl'
      : 'w-full';
  return <div className={width}><GoogleAdSlot placement={placement} /></div>;
}
