import fetch from "node-fetch";

/**
 * PayPal Access Token (Sandbox / Live dynamic)
 */
export async function getPayPalAccessToken() {
  const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();

  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal env variables (CLIENT_ID or SECRET)");
  }

  const baseURL =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

if (process.env.NODE_ENV !== "production") {
  console.log("PAYPAL MODE:", mode);
  console.log("PAYPAL BASE:", baseURL);
}

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();

    console.error("[PAYPAL AUTH ERROR]", {
      status: res.status,
      body: err,
      mode,
    });

    throw new Error("PayPal Auth Failed: " + err);
  }

  const data = await res.json();
  return data.access_token;
}
