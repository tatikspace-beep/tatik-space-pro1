import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "tatik-cookie-details";
const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as string | undefined;

function hasAnalyticsConsent() {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return false;
    const preferences = JSON.parse(stored) as { analytics?: unknown };
    return preferences.analytics === true;
  } catch {
    return false;
  }
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
  const [consent, setConsent] = useState(hasAnalyticsConsent);
  const [location] = useLocation();
  const configuredId = useRef<string | null>(null);
  const lastPageView = useRef<string | null>(null);

  useEffect(() => {
    const refreshConsent = () => setConsent(hasAnalyticsConsent());
    window.addEventListener("tatik:consent-updated", refreshConsent);
    return () => window.removeEventListener("tatik:consent-updated", refreshConsent);
  }, []);

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
  }, []);

  useEffect(() => {
    window.gtag?.("consent", "update", {
      analytics_storage: consent ? "granted" : "denied",
    });
    if (!consent || !GA_ID) {
      lastPageView.current = null;
      return;
    }

    loadAnalyticsScript(GA_ID);
    if (configuredId.current !== GA_ID) {
      window.gtag?.("js", new Date());
      window.gtag?.("config", GA_ID, { anonymize_ip: true, send_page_view: false });
      configuredId.current = GA_ID;
    }

    if (lastPageView.current !== window.location.href) {
      window.gtag?.("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
      });
      lastPageView.current = window.location.href;
    }
  }, [consent, location]);

  return null;
}
