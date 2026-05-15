using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Auth
{
    public class LoginFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/auth/login", Handle)
                .WithName("Login")
                .WithTags("Auth");
        }

        private static async Task<IResult> Handle(LoginRequest request, IAuthService authService, HttpContext httpContext)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest("Email and Password are required.");

            var result = await authService.LoginAsync(new LoginInput(request.Email, request.Password));
            if (result is null)
                return Results.Unauthorized();

            await AuthHelpers.SignIn(httpContext, result);
            return Results.Ok(new AuthResponse(result.UserId, result.TenantId, result.Email, result.DisplayName));
        }
    }

    public record LoginRequest(string Email, string Password);
}
