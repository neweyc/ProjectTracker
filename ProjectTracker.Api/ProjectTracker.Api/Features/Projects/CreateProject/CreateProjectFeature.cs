using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Projects.CreateProject
{
    public class CreateProjectFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/projects", Handle)
                .WithName("CreateProject")
                .WithTags("Projects")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(CreateProjectRequest request, IProjectService projectService, IBillingService billingService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest("Name is required.");

            var tier = await billingService.GetSubscriptionTierAsync(currentUser.TenantId);
            var max = SubscriptionLimits.MaxProjects(tier);
            if (max.HasValue && await projectService.CountAsync(currentUser.TenantId) >= max.Value)
                return Results.Json(new { error = "limit_reached", message = SubscriptionLimits.UpgradeMessage("projects", max.Value) }, statusCode: 402);

            var project = await projectService.CreateWithClientAsync(request.Name.Trim(), request.Description?.Trim(), request.ClientId, currentUser.TenantId);
            var response = new CreateProjectResponse(project.Id, project.Name, project.Description, project.ClientId, project.CreatedAt);
            return Results.Created($"/api/projects/{project.Id}", response);
        }
    }

    public record CreateProjectRequest(string Name, string? Description, int? ClientId);
    public record CreateProjectResponse(int Id, string Name, string? Description, int? ClientId, DateTime CreatedAt);
}
