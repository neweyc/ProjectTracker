using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using ProjectTracker.Api.Routing;

namespace ProjectTracker.Api.Features.Auth
{
    public class LogoutFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/auth/logout", Handle)
                .WithName("Logout")
                .WithTags("Auth")
                .RequireAuthorization();
        }

        private static async Task Handle(HttpContext httpContext)
        {
            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }
    }
}
