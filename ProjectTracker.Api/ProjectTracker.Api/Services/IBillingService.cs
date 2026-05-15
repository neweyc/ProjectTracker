namespace ProjectTracker.Api.Services
{
    public interface IBillingService
    {
        Task<string> CreateCheckoutSessionAsync(int tenantId, string tier, string successUrl, string cancelUrl);
        Task<string> CreatePortalSessionAsync(int tenantId, string returnUrl);
        Task HandleWebhookAsync(string json, string signatureHeader);
        Task<string?> GetSubscriptionStatusAsync(int tenantId);
        Task<string> GetSubscriptionTierAsync(int tenantId);
    }
}
