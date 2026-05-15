using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Projects.UpdateProject
{
    public class UpdateProjectFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/api/projects/{id:int}", Handle)
                .WithName("UpdateProject")
                .WithTags("Projects")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, UpdateProjectRequest request, IProjectService projectService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest("Name is required.");

            var project = await projectService.UpdateAsync(id, request.Name.Trim(), request.Description?.Trim(), currentUser.TenantId);
            if (project is null) return Results.NotFound();

            return Results.Ok(new UpdateProjectResponse(project.Id, project.Name, project.Description, project.CreatedAt));
        }
    }

    public record UpdateProjectRequest(string Name, string? Description);
    public record UpdateProjectResponse(int Id, string Name, string? Description, DateTime CreatedAt);
}
