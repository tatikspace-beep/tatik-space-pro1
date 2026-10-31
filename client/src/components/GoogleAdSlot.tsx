import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const adSlots = {
  editor: import.meta.env.VITE_GOOGLE_AD_SLOT_EDITOR as string | undefined,
  marketplace: import.meta.env.VITE_GOOGLE_AD_SLOT_MARKETPLACE as string | undefined,
  footer: import.meta.env.VITE_GOOGLE_AD_SLOT_FOOTER as string | undefined,
  sidebar: import.meta.env.VITE_GOOGLE_AD_SLOT_SIDEBAR as string | undefined,
};

export type GoogleAdPlacement = keyof typeof adSlots;

export function getGoogleAdSlot(placement: GoogleAdPlacement) {
  return adSlots[placement]?.trim() || null;
}

function readMarketingConsent() {
  if (typeof window === "undefined") return false;
  try {
    const value = window.localStorage.getItem("tatik-cookie-details");
    if (!value) return false;
    const consent = JSON.parse(value) as { marketing?: boolean; expiresAt?: string };
    return consent.marketing === true
      && typeof consent.expiresAt === "string"
      && Date.parse(consent.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

export function GoogleAdSlot({ placement }: { placement: GoogleAdPlacement }) {
  const [marketingConsent, setMarketingConsent] = useState(readMarketingConsent);
  const pushedSlot = useRef<string | null>(null);
  const slot = getGoogleAdSlot(placement);

  useEffect(() => {
    const refreshConsent = () => setMarketingConsent(readMarketingConsent());
    window.addEventListener("tatik:consent-updated", refreshConsent);
    return () => window.removeEventListener("tatik:consent-updated", refreshConsent);
  }, []);

  useEffect(() => {
    if (!marketingConsent || !slot || pushedSlot.current === slot) return;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
    pushedSlot.current = slot;
  }, [marketingConsent, slot]);

  if (!marketingConsent || !slot) return null;
  return (
    <ins
      className="adsbygoogle block min-w-0"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9138899859522184"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-label="Annuncio"
    />
  );
}
