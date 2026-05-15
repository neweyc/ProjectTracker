using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Tasks.CreateTask
{
    public class CreateTaskFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/tasks", Handle)
                .WithName("CreateTask")
                .WithTags("Tasks")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(CreateTaskRequest request, ITaskService taskService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest("Title is required.");

            if (!await taskService.ProjectExistsAsync(request.ProjectId, currentUser.TenantId))
                return Results.BadRequest($"Project {request.ProjectId} does not exist.");

            var task = await taskService.CreateAsync(
                request.ProjectId, request.ParentTaskId, request.Title.Trim(), request.Description?.Trim(), currentUser.TenantId);

            if (task is null)
                return Results.BadRequest("Parent task not found or is already a subtask.");

            return Results.Created($"/api/tasks/{task.Id}", new CreateTaskResponse(
                task.Id, task.ProjectId, task.ParentTaskId,
                task.Title, task.Description, task.Status.ToString(),
                task.IsInvoiced, task.CreatedAt));
        }
    }

    public record CreateTaskRequest(int ProjectId, int? ParentTaskId, string Title, string? Description);
    public record CreateTaskResponse(int Id, int ProjectId, int? ParentTaskId, string Title, string? Description, string Status, bool IsInvoiced, DateTime CreatedAt);
}
