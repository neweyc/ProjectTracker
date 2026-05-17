using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TaskTypes.CreateTaskType
{
    public class CreateTaskTypeFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/task-types", Handle)
                .WithName("CreateTaskType")
                .WithTags("TaskTypes")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(CreateTaskTypeRequest request, ITaskTypeService taskTypeService, ICurrentUser currentUser)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest("Name is required.");

            if (string.IsNullOrWhiteSpace(request.Color))
                return Results.BadRequest("Color is required.");

            var taskType = await taskTypeService.CreateAsync(currentUser.TenantId, new TaskTypeInput(request.Name, request.Color));
            return Results.Created($"/api/task-types/{taskType.Id}", new CreateTaskTypeResponse(taskType.Id, taskType.Name, taskType.Color, taskType.SortOrder));
        }
    }

    public record CreateTaskTypeRequest(string Name, string Color);
    public record CreateTaskTypeResponse(int Id, string Name, string Color, int SortOrder);
}
