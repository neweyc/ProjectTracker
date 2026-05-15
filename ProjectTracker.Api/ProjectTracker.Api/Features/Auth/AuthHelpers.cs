using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Auth
{
    internal static class AuthHelpers
    {
        internal static Task SignIn(HttpContext ctx, AuthResult result)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, result.UserId.ToString()),
                new Claim("tenant_id", result.TenantId.ToString()),
                new Claim(ClaimTypes.Email, result.Email),
                new Claim(ClaimTypes.Name, result.DisplayName),
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            return ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
        }
    }

    public record AuthResponse(int UserId, int TenantId, string Email, string DisplayName, string? SubscriptionStatus = null, string? SubscriptionTier = "Free");
}
