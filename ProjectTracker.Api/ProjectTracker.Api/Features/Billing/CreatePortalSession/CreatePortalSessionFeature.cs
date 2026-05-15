using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Billing.CreatePortalSession
{
    public class CreatePortalSessionFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/billing/portal", Handle)
                .WithName("CreatePortalSession")
                .WithTags("Billing")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(
            CreatePortalSessionRequest request,
            IBillingService billingService,
            ICurrentUser currentUser)
        {
            try
            {
                var url = await billingService.CreatePortalSessionAsync(currentUser.TenantId, request.ReturnUrl);
                return Results.Ok(new { Url = url });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        }
    }

    public record CreatePortalSessionRequest(string ReturnUrl);
}
