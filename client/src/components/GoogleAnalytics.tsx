import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __tcfapi?: (
      command: "addEventListener" | "removeEventListener",
      version: number,
      callback: (data: GatekeeperTCData | null, success: boolean) => void,
      listenerId?: number,
    ) => void;
  }
}

type GatekeeperTCData = {
  eventStatus?: string;
  listenerId?: number;
  purpose?: { consents?: Record<number, boolean> };
  vendor?: { consents?: Record<number, boolean> };
};

const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as string | undefined;

function hasGatekeeperAnalyticsConsent(data: GatekeeperTCData) {
  return data.purpose?.consents?.[1] === true
    && data.purpose?.consents?.[8] === true
    && data.vendor?.consents?.[755] === true;
}

function loadAnalyticsScript(measurementId: string) {
  if (document.getElementById("tatik-google-analytics")) return;
  const script = document.createElement("script");
  script.id = "tatik-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function GoogleAnalytics() {
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean | null>(null);
  const [location] = useLocation();
  const configuredId = useRef<string | null>(null);
  const lastPageView = useRef<{ pageLocation: string; analyticsConsent: boolean } | null>(null);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });

    if (!GA_ID) return;

    loadAnalyticsScript(GA_ID);
    if (configuredId.current !== GA_ID) {
      window.gtag?.("js", new Date());
      window.gtag?.("config", GA_ID, { anonymize_ip: true, send_page_view: false });
      configuredId.current = GA_ID;
    }
  }, []);

  useEffect(() => {
    if (!window.__tcfapi) {
      console.error("[GoogleAnalytics] Gatekeeper TCF is unavailable; Analytics consent remains denied.");
      setAnalyticsConsent(false);
      return;
    }

    let listenerId: number | undefined;
    const timeout = window.setTimeout(() => {
      console.error("[GoogleAnalytics] Gatekeeper did not provide TCF consent; Analytics consent remains denied.");
      setAnalyticsConsent(false);
    }, 2000);
    const onConsentChange = (data: GatekeeperTCData | null, success: boolean) => {
      if (!success || !data) return;
      if (typeof data.listenerId === "number") listenerId = data.listenerId;

      if (data.eventStatus === "cmpuishown") {
        window.clearTimeout(timeout);
        setAnalyticsConsent(false);
        return;
      }

      if (data.eventStatus === "tcloaded" || data.eventStatus === "useractioncomplete") {
        window.clearTimeout(timeout);
        setAnalyticsConsent(hasGatekeeperAnalyticsConsent(data));
      }
    };

    window.__tcfapi("addEventListener", 2, onConsentChange);
    return () => {
      window.clearTimeout(timeout);
      if (typeof listenerId === "number") {
        window.__tcfapi?.("removeEventListener", 2, () => {}, listenerId);
      }
    };
  }, []);

  useEffect(() => {
    if (analyticsConsent === null) return;

    window.gtag?.("consent", "update", {
      analytics_storage: analyticsConsent ? "granted" : "denied",
    });

    if (!GA_ID) return;
    const pageLocation = window.location.href;
    const previousPageView = lastPageView.current;
    const samePage = previousPageView?.pageLocation === pageLocation;
    const consentWasGranted = previousPageView?.analyticsConsent === true;
    const shouldSendPageView = !samePage || (analyticsConsent && !consentWasGranted);

    if (!shouldSendPageView) {
      if (samePage) lastPageView.current = { pageLocation, analyticsConsent };
      return;
    }

    const timeout = window.setTimeout(() => {
      if (window.location.href !== pageLocation) return;
      window.gtag?.("event", "page_view", {
        page_title: document.title,
        page_location: pageLocation,
      });
      lastPageView.current = { pageLocation, analyticsConsent };
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [analyticsConsent, location]);

  return null;
}
