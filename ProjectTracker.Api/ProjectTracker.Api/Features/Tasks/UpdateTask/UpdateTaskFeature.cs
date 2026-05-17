using ProjectTracker.Api.Data.Entities;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Tasks.UpdateTask
{
    public class UpdateTaskFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/api/tasks/{id:int}", Handle)
                .WithName("UpdateTask")
                .WithTags("Tasks")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, UpdateTaskRequest request, ITaskService taskService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest("Title is required.");

            var task = await taskService.UpdateAsync(
                id, request.Title.Trim(), request.Description?.Trim(), request.IsInvoiced, request.TypeId, request.Priority, currentUser.TenantId);

            if (task is null) return Results.NotFound();

            return Results.Ok(new UpdateTaskResponse(
                task.Id, task.ProjectId, task.ParentTaskId,
                task.Title, task.Description, task.Status.ToString(),
                task.IsInvoiced, task.CreatedAt, task.TypeId, task.Priority?.ToString()));
        }
    }

    public record UpdateTaskRequest(string Title, string? Description, bool IsInvoiced, int? TypeId, ProjectTaskPriority? Priority);
    public record UpdateTaskResponse(int Id, int ProjectId, int? ParentTaskId, string Title, string? Description, string Status, bool IsInvoiced, DateTime CreatedAt, int? TypeId, string? Priority);
}
