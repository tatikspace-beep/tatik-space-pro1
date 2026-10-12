type PayPalResponse = {
  id?: string;
  links?: Array<{ rel?: string; href?: string }>;
  [key: string]: unknown;
};

function getPayPalBaseUrl() {
  const mode = (process.env.PAYPAL_ENV || process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function requirePayPalConfig() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizePayPalDiagnostic(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  return value
    .slice(0, maxLength)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
    .replace(
      /\b(?:client_secret|access_token|authorization)\s*[:=]\s*\S+/gi,
      "[redacted-credential]",
    );
}

function getPayPalErrorDiagnostics(payload: unknown) {
  const response = isRecord(payload) ? payload : {};
  const details = Array.isArray(response.details)
    ? response.details.flatMap((detail: unknown) => {
        if (!isRecord(detail)) return [];
        const safeDetail = {
          issue: sanitizePayPalDiagnostic(detail.issue, 100),
          field: sanitizePayPalDiagnostic(detail.field, 200),
          description: sanitizePayPalDiagnostic(detail.description, 300),
        };
        return Object.values(safeDetail).some(Boolean) ? [safeDetail] : [];
      })
    : [];

  return {
    name: sanitizePayPalDiagnostic(response.name, 100),
    debugId: sanitizePayPalDiagnostic(response.debug_id, 100),
    details,
  };
}

async function getAccessToken() {
  requirePayPalConfig();
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.access_token !== "string") {
    throw new Error(`PayPal authentication failed (${response.status})`);
  }
  return payload.access_token as string;
}

async function paypalRequest(path: string, init: RequestInit = {}): Promise<PayPalResponse> {
  const token = await getAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("[PayPal] API request failed", {
      status: response.status,
      ...getPayPalErrorDiagnostics(payload),
    });
    throw new Error(`PayPal API error (${response.status})`);
  }
  return payload as PayPalResponse;
}

export async function createPayPalSubscription(input: {
  planId: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  return paypalRequest("/v1/billing/subscriptions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      plan_id: input.planId,
      custom_id: input.customId.slice(0, 127),
      application_context: {
        brand_name: "Tatik.space",
        user_action: "SUBSCRIBE_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });
}
