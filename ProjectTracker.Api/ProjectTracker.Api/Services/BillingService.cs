using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using Stripe;
using Stripe.Checkout;
using Stripe.BillingPortal;

namespace ProjectTracker.Api.Services
{
    public class BillingService(
        ProjectTrackerDbContext context,
        IConfiguration configuration,
        ILogger<BillingService> logger) : IBillingService
    {
        private readonly string _priceId = configuration["Stripe:PriceId"] ?? throw new InvalidOperationException("Stripe:PriceId is not configured.");
        private readonly string _webhookSecret = configuration["Stripe:WebhookSecret"] ?? throw new InvalidOperationException("Stripe:WebhookSecret is not configured.");

        public async Task<string> CreateCheckoutSessionAsync(int tenantId, string successUrl, string cancelUrl)
        {
            var tenant = await context.Tenants.FindAsync(tenantId)
                ?? throw new InvalidOperationException("Tenant not found.");

            var options = new Stripe.Checkout.SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        Price = _priceId,
                        Quantity = 1,
                    },
                ],
                Mode = "subscription",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                ClientReferenceId = tenantId.ToString(),
            };

            if (!string.IsNullOrEmpty(tenant.StripeCustomerId))
            {
                options.Customer = tenant.StripeCustomerId;
            }

            var service = new Stripe.Checkout.SessionService();
            var session = await service.CreateAsync(options);
            return session.Url;
        }

        public async Task<string> CreatePortalSessionAsync(int tenantId, string returnUrl)
        {
            var tenant = await context.Tenants.FindAsync(tenantId)
                ?? throw new InvalidOperationException("Tenant not found.");

            if (string.IsNullOrEmpty(tenant.StripeCustomerId))
            {
                throw new InvalidOperationException("Tenant does not have a Stripe Customer ID.");
            }

            var options = new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = tenant.StripeCustomerId,
                ReturnUrl = returnUrl,
            };

            var service = new Stripe.BillingPortal.SessionService();
            var session = await service.CreateAsync(options);
            return session.Url;
        }

        public async Task<string?> GetSubscriptionStatusAsync(int tenantId)
        {
            var tenant = await context.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);
            return tenant?.SubscriptionStatus;
        }

        public async Task HandleWebhookAsync(string json, string signatureHeader)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, _webhookSecret);

                switch (stripeEvent.Type)
                {
                    case "checkout.session.completed":
                        await HandleCheckoutSessionCompleted(stripeEvent.Data.Object as Stripe.Checkout.Session);
                        break;
                    case "customer.subscription.updated":
                    case "customer.subscription.deleted":
                        await HandleSubscriptionChanged(stripeEvent.Data.Object as Subscription);
                        break;
                }
            }
            catch (StripeException e)
            {
                logger.LogError(e, "Stripe webhook error");
                throw;
            }
        }

        private async Task HandleCheckoutSessionCompleted(Stripe.Checkout.Session? session)
        {
            if (session == null || string.IsNullOrEmpty(session.ClientReferenceId)) return;

            var tenantId = int.Parse(session.ClientReferenceId);
            var tenant = await context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant != null)
            {
                tenant.StripeCustomerId = session.CustomerId;
                tenant.StripeSubscriptionId = session.SubscriptionId;
                tenant.SubscriptionStatus = "active"; // Initial status
                await context.SaveChangesAsync();
            }
        }

        private async Task HandleSubscriptionChanged(Subscription? subscription)
        {
            if (subscription == null) return;

            var tenant = await context.Tenants.FirstOrDefaultAsync(t => t.StripeSubscriptionId == subscription.Id);
            if (tenant != null)
            {
                tenant.SubscriptionStatus = subscription.Status;
                await context.SaveChangesAsync();
            }
        }
    }
}
