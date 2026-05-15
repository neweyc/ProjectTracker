using Microsoft.AspNetCore.Mvc;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Billing.Webhook
{
    public class StripeWebhookFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            // Webhooks are called by Stripe, so we don't RequireAuthorization()
            app.MapPost("/api/webhooks/stripe", Handle)
                .WithName("StripeWebhook")
                .WithTags("Billing");
        }

        private static async Task<IResult> Handle(
            HttpRequest request,
            IBillingService billingService)
        {
            var json = await new StreamReader(request.Body).ReadToEndAsync();
            var signatureHeader = request.Headers["Stripe-Signature"];

            if (string.IsNullOrEmpty(signatureHeader))
            {
                return Results.BadRequest("Missing Stripe-Signature header.");
            }

            try
            {
                await billingService.HandleWebhookAsync(json, signatureHeader!);
                return Results.Ok();
            }
            catch (Exception ex)
            {
                // Note: In production, you might not want to return the full exception message
                return Results.BadRequest($"Webhook Error: {ex.Message}");
            }
        }
    }
}
