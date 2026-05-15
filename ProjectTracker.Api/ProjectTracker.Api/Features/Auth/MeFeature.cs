using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Auth
{
    public class MeFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/auth/me", Handle)
                .WithName("Me")
                .WithTags("Auth")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(ICurrentUser currentUser, IBillingService billingService)
        {
            var status = await billingService.GetSubscriptionStatusAsync(currentUser.TenantId);
            return Results.Ok(new AuthResponse(
                currentUser.UserId,
                currentUser.TenantId,
                currentUser.Email,
                currentUser.DisplayName,
                status));
        }
    }
}
