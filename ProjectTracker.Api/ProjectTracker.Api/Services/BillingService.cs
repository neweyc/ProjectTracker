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
        ILogger<BillingService> logger,
        IEmailService emailService) : IBillingService
    {
        private readonly string _soloPriceId = configuration["Stripe:SoloPriceId"] ?? throw new InvalidOperationException("Stripe:SoloPriceId is not configured.");
        private readonly string _teamPriceId = configuration["Stripe:TeamPriceId"] ?? throw new InvalidOperationException("Stripe:TeamPriceId is not configured.");
        private readonly string _webhookSecret = configuration["Stripe:WebhookSecret"] ?? throw new InvalidOperationException("Stripe:WebhookSecret is not configured.");

        public async Task<string> CreateCheckoutSessionAsync(int tenantId, string tier, string successUrl, string cancelUrl)
        {
            var tenant = await context.Tenants.FindAsync(tenantId)
                ?? throw new InvalidOperationException("Tenant not found.");

            var priceId = tier == "Team" ? _teamPriceId : _soloPriceId;

            var options = new Stripe.Checkout.SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        Price = priceId,
                        Quantity = 1,
                    },
                ],
                Mode = "subscription",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                ClientReferenceId = tenantId.ToString(),
                Metadata = new Dictionary<string, string>
                {
                    { "SubscriptionTier", tier }
                }
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

        public async Task<string> GetSubscriptionTierAsync(int tenantId)
        {
            var tenant = await context.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            // Revoke access for canceled/unpaid subscriptions; keep access during
            // past_due so users aren't locked out while Stripe retries the card.
            if (tenant?.SubscriptionStatus is "canceled" or "unpaid")
                return "Free";

            return tenant?.SubscriptionTier ?? "Free";
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
                    case "invoice.payment_failed":
                        await HandlePaymentFailed(stripeEvent.Data.Object as Invoice);
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

                if (session.Metadata.TryGetValue("SubscriptionTier", out var tier))
                {
                    tenant.SubscriptionTier = tier;
                }
                else
                {
                    // Fallback just in case
                    tenant.SubscriptionTier = "Solo"; 
                }

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

        private async Task HandlePaymentFailed(Invoice? invoice)
        {
            if (invoice?.CustomerId == null) return;

            var tenant = await context.Tenants
                .Include(t => t.Users)
                .FirstOrDefaultAsync(t => t.StripeCustomerId == invoice.CustomerId);

            if (tenant == null) return;

            var attemptCount = invoice.AttemptCount;
            var nextAttempt = invoice.NextPaymentAttempt;
            var nextAttemptText = nextAttempt.HasValue
                ? $"Stripe will automatically retry on <strong>{nextAttempt.Value:MMMM d, yyyy}</strong>."
                : "This was the final attempt. Your subscription has been canceled.";

            var html = $"""
                <!DOCTYPE html>
                <html>
                <body style="font-family: sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <div style="border-left: 4px solid #ef4444; padding-left: 16px; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 4px; color: #ef4444;">Payment failed</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Olive Invoice subscription could not be renewed</p>
                  </div>
                  <p>Hi {System.Net.WebUtility.HtmlEncode(tenant.Name)},</p>
                  <p>We were unable to process your subscription payment (attempt {attemptCount}). {nextAttemptText}</p>
                  <p>To avoid any interruption to your service, please update your payment method:</p>
                  <p style="margin: 24px 0;">
                    <a href="https://oliveinvoice.com"
                       style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                      Update Payment Method
                    </a>
                  </p>
                  <p style="color: #6b7280; font-size: 13px;">
                    If you have any questions, reply to this email or contact us at
                    <a href="mailto:admin@craytech-solutions.com" style="color: #7c3aed;">admin@craytech-solutions.com</a>.
                  </p>
                </body>
                </html>
                """;

            var tasks = tenant.Users.Select(user =>
                emailService.SendAsync(
                    user.Email,
                    "Action required: Your Olive Invoice payment failed",
                    html
                ));

            await Task.WhenAll(tasks);
        }
    }
}
