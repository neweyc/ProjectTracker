using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Tasks.GetTasks
{
    public class GetTasksFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/projects/{projectId:int}/tasks", Handle)
                .WithName("GetTasks")
                .WithTags("Tasks")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int projectId, ITaskService taskService, ICurrentUser currentUser)
        {
            if (!await taskService.ProjectExistsAsync(projectId, currentUser.TenantId))
                return Results.NotFound($"Project {projectId} does not exist.");

            var tasks = await taskService.GetTopLevelByProjectAsync(projectId, currentUser.TenantId);
            var response = tasks.Select(t => new GetTasksResponse(
                t.Id, t.ProjectId, t.Title, t.Description, t.Status.ToString(),
                t.IsInvoiced, t.SubTasks.Count,
                t.TimeEntries.Sum(e => e.Hours), t.CreatedAt,
                t.TypeId, t.Type?.Name, t.Type?.Color,
                t.Priority?.ToString()));

            return Results.Ok(response);
        }
    }

    public record GetTasksResponse(int Id, int ProjectId, string Title, string? Description, string Status, bool IsInvoiced, int SubTaskCount, decimal TotalHours, DateTime CreatedAt, int? TypeId, string? TypeName, string? TypeColor, string? Priority);
}
