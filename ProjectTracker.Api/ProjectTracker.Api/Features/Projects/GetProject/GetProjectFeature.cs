using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Projects.GetProject
{
    public class GetProjectFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/projects/{id:int}", Handle)
                .WithName("GetProject")
                .WithTags("Projects")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, IProjectService projectService, ICurrentUser currentUser)
        {
            var project = await projectService.GetByIdAsync(id, currentUser.TenantId);
            if (project is null) return Results.NotFound();

            var tasks = project.Tasks.Select(t => new TaskDetail(
                t.Id, t.Title, t.Description, t.Status.ToString(), t.IsInvoiced, t.CreatedAt,
                t.TimeEntries.Sum(e => e.Hours),
                t.SubTasks.Select(s => new SubTaskSummary(s.Id, s.Title, s.Status.ToString(), s.IsInvoiced, s.CreatedAt))
            ));

            return Results.Ok(new GetProjectResponse(project.Id, project.Name, project.Description, project.ClientId, project.CreatedAt, tasks));
        }
    }

    public record SubTaskSummary(int Id, string Title, string Status, bool IsInvoiced, DateTime CreatedAt);
    public record TaskDetail(int Id, string Title, string? Description, string Status, bool IsInvoiced, DateTime CreatedAt, decimal TotalHours, IEnumerable<SubTaskSummary> SubTasks);
    public record GetProjectResponse(int Id, string Name, string? Description, int? ClientId, DateTime CreatedAt, IEnumerable<TaskDetail> Tasks);
}
