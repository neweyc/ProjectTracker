using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Auth
{
    public class RegisterFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/auth/register", Handle)
                .WithName("Register")
                .WithTags("Auth");
        }

        private static async Task<IResult> Handle(RegisterRequest request, IAuthService authService, IBillingService billingService, HttpContext httpContext)
        {
            if (string.IsNullOrWhiteSpace(request.TenantName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest("TenantName, Email and Password are required.");

            var (result, error) = await authService.RegisterAsync(new RegisterInput(
                request.TenantName,
                request.Email,
                request.DisplayName ?? request.Email,
                request.Password));

            if (result is null)
                return Results.Conflict(new { error });

            await AuthHelpers.SignIn(httpContext, result);
            var status = await billingService.GetSubscriptionStatusAsync(result.TenantId);
            var tier = await billingService.GetSubscriptionTierAsync(result.TenantId);
            return Results.Ok(new AuthResponse(result.UserId, result.TenantId, result.Email, result.DisplayName, status, tier));
        }
    }

    public record RegisterRequest(string TenantName, string Email, string Password, string? DisplayName);
}
