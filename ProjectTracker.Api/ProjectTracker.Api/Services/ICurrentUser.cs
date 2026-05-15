using System.Security.Claims;

namespace ProjectTracker.Api.Services
{
    public interface ICurrentUser
    {
        int UserId { get; }
        int TenantId { get; }
        string Email { get; }
        string DisplayName { get; }
        bool IsAuthenticated { get; }
    }

    public class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
    {
        private ClaimsPrincipal? Principal => httpContextAccessor.HttpContext?.User;

        public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;
        public int UserId => int.Parse(Principal!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        public int TenantId => int.Parse(Principal!.FindFirstValue("tenant_id")!);
        public string Email => Principal!.FindFirstValue(ClaimTypes.Email)!;
        public string DisplayName => Principal!.FindFirstValue(ClaimTypes.Name)!;
    }
}
