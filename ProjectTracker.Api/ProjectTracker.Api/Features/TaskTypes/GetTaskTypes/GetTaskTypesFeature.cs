using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TaskTypes.GetTaskTypes
{
    public class GetTaskTypesFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/task-types", Handle)
                .WithName("GetTaskTypes")
                .WithTags("TaskTypes")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(ITaskTypeService taskTypeService, ICurrentUser currentUser)
        {
            var types = await taskTypeService.GetByTenantAsync(currentUser.TenantId);
            return Results.Ok(types.Select(t => new TaskTypeResponse(t.Id, t.Name, t.Color, t.SortOrder)));
        }
    }

    public record TaskTypeResponse(int Id, string Name, string Color, int SortOrder);
}
