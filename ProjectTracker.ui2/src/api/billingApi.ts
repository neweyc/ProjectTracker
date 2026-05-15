import { apiClient } from "./client";

export const billingApi = {
  createCheckoutSession: (tier: string, successUrl: string, cancelUrl: string) =>
    apiClient.post<{ url: string }>("/api/billing/checkout", {
      tier,
      successUrl,
      cancelUrl,
    }),
  createPortalSession: (returnUrl: string) =>
    apiClient.post<{ url: string }>("/api/billing/portal", { returnUrl }),
};
