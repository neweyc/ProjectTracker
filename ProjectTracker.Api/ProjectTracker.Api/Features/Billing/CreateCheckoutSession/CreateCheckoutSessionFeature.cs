using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Billing.CreateCheckoutSession
{
    public class CreateCheckoutSessionFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/billing/checkout", Handle)
                .WithName("CreateCheckoutSession")
                .WithTags("Billing")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(
            CreateCheckoutSessionRequest request,
            IBillingService billingService,
            ICurrentUser currentUser)
        {
            try
            {
                var url = await billingService.CreateCheckoutSessionAsync(
                    currentUser.TenantId,
                    request.SuccessUrl,
                    request.CancelUrl);

                return Results.Ok(new { Url = url });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        }
    }

    public record CreateCheckoutSessionRequest(string SuccessUrl, string CancelUrl);
}
