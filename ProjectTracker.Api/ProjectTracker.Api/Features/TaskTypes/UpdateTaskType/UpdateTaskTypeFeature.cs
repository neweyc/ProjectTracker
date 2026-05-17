using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TaskTypes.UpdateTaskType
{
    public class UpdateTaskTypeFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/api/task-types/{id:int}", Handle)
                .WithName("UpdateTaskType")
                .WithTags("TaskTypes")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, UpdateTaskTypeRequest request, ITaskTypeService taskTypeService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest("Name is required.");

            if (string.IsNullOrWhiteSpace(request.Color))
                return Results.BadRequest("Color is required.");

            var taskType = await taskTypeService.UpdateAsync(id, currentUser.TenantId, new TaskTypeInput(request.Name, request.Color));
            return taskType is null ? Results.NotFound() : Results.Ok(new UpdateTaskTypeResponse(taskType.Id, taskType.Name, taskType.Color, taskType.SortOrder));
        }
    }

    public record UpdateTaskTypeRequest(string Name, string Color);
    public record UpdateTaskTypeResponse(int Id, string Name, string Color, int SortOrder);
}
