using ProjectTracker.Api.Data;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace ProjectTracker.Api.Features.Settings.Users
{
    public class GetUsersFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/settings/users", Handle)
                .WithName("GetUsers")
                .WithTags("Settings")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(ProjectTrackerDbContext context, ICurrentUser currentUser)
        {
            var users = await context.Users
                .Where(u => u.TenantId == currentUser.TenantId)
                .OrderBy(u => u.CreatedAt)
                .Select(u => new UserListItem(u.Id, u.Email, u.DisplayName, u.CreatedAt))
                .ToListAsync();

            return Results.Ok(users);
        }
    }

    public record UserListItem(int Id, string Email, string DisplayName, DateTime CreatedAt);
}
