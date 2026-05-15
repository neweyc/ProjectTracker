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

        private static async Task<IResult> Handle(CreateProjectRequest request, IProjectService projectService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest("Name is required.");

            var project = await projectService.CreateAsync(request.Name.Trim(), request.Description?.Trim(), currentUser.TenantId);
            var response = new CreateProjectResponse(project.Id, project.Name, project.Description, project.CreatedAt);
            return Results.Created($"/api/projects/{project.Id}", response);
        }
    }

    public record CreateProjectRequest(string Name, string? Description);
    public record CreateProjectResponse(int Id, string Name, string? Description, DateTime CreatedAt);
}
