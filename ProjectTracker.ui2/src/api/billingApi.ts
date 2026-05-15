import { apiClient } from "./client";

export const billingApi = {
  createCheckoutSession: (successUrl: string, cancelUrl: string) =>
    apiClient.post<{ url: string }>("/api/billing/checkout", {
      successUrl,
      cancelUrl,
    }),
  createPortalSession: (returnUrl: string) =>
    apiClient.post<{ url: string }>("/api/billing/portal", { returnUrl }),
};
