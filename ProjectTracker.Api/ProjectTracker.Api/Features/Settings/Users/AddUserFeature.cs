using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Settings.Users
{
    public class AddUserFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/settings/users", Handle)
                .WithName("AddUser")
                .WithTags("Settings")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(AddUserRequest request, IAuthService authService, ICurrentUser currentUser)
        {
            var (user, error) = await authService.AddUserToTenantAsync(
                currentUser.TenantId, 
                request.Email, 
                request.DisplayName, 
                request.Password);

            if (error != null)
                return Results.BadRequest(new { message = error });

            return Results.Ok(new { 
                id = user!.Id, 
                email = user.Email, 
                displayName = user.DisplayName 
            });
        }
    }

    public record AddUserRequest(string Email, string DisplayName, string Password);
}
