using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Projects.GetProjects
{
    public class GetProjectsFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/projects", Handle)
                .WithName("GetProjects")
                .WithTags("Projects")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(IProjectService projectService, ICurrentUser currentUser)
        {
            var projects = await projectService.GetAllAsync(currentUser.TenantId);
            var response = projects.Select(p => new GetProjectsResponse(
                p.Id, p.Name, p.Description, p.CreatedAt, p.TaskCount));
            return Results.Ok(response);
        }
    }

    public record GetProjectsResponse(int Id, string Name, string? Description, DateTime CreatedAt, int TaskCount);
}
