using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Tasks.GetTask
{
    public class GetTaskFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/tasks/{id:int}", Handle)
                .WithName("GetTask")
                .WithTags("Tasks")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, ITaskService taskService, ICurrentUser currentUser)
        {
            var task = await taskService.GetByIdAsync(id, currentUser.TenantId);
            if (task is null) return Results.NotFound();

            var response = new GetTaskResponse(
                task.Id, task.ProjectId, task.ParentTaskId,
                task.Title, task.Description, task.Status.ToString(),
                task.IsInvoiced, task.CreatedAt,
                task.TimeEntries.Sum(e => e.Hours),
                task.TypeId, task.Type?.Name, task.Type?.Color,
                task.SubTasks.Select(s => new SubTaskResponse(
                    s.Id, s.Title, s.Description, s.Status.ToString(), s.IsInvoiced, s.CreatedAt)),
                task.TimeEntries.Select(e => new TimeEntryResponse(
                    e.Id, e.Hours, e.Date, e.Notes, e.CreatedAt)));

            return Results.Ok(response);
        }
    }

    public record SubTaskResponse(int Id, string Title, string? Description, string Status, bool IsInvoiced, DateTime CreatedAt);
    public record TimeEntryResponse(int Id, decimal Hours, DateTime Date, string? Notes, DateTime CreatedAt);
    public record GetTaskResponse(int Id, int ProjectId, int? ParentTaskId, string Title, string? Description, string Status, bool IsInvoiced, DateTime CreatedAt, decimal TotalHours, int? TypeId, string? TypeName, string? TypeColor, IEnumerable<SubTaskResponse> SubTasks, IEnumerable<TimeEntryResponse> TimeEntries);
}
