using ProjectTracker.Api.Data.Entities;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Tasks.UpdateTaskStatus
{
    public class UpdateTaskStatusFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPatch("/api/tasks/{id:int}/status", Handle)
                .WithName("UpdateTaskStatus")
                .WithTags("Tasks")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, UpdateTaskStatusRequest request, ITaskService taskService, ICurrentUser currentUser)
        {
            if (!Enum.TryParse<ProjectTaskStatus>(request.Status, ignoreCase: true, out var status))
                return Results.BadRequest(
                    $"Invalid status. Valid values: {string.Join(", ", Enum.GetNames<ProjectTaskStatus>())}");

            var task = await taskService.UpdateStatusAsync(id, status, currentUser.TenantId);
            if (task is null) return Results.NotFound();

            return Results.Ok(new UpdateTaskStatusResponse(task.Id, task.Status.ToString()));
        }
    }

    public record UpdateTaskStatusRequest(string Status);
    public record UpdateTaskStatusResponse(int Id, string Status);
}
