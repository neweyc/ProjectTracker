using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TaskTypes.DeleteTaskType
{
    public class DeleteTaskTypeFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/api/task-types/{id:int}", Handle)
                .WithName("DeleteTaskType")
                .WithTags("TaskTypes")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, ITaskTypeService taskTypeService, ICurrentUser currentUser)
        {
            var deleted = await taskTypeService.DeleteAsync(id, currentUser.TenantId);
            return deleted ? Results.NoContent() : Results.NotFound();
        }
    }
}
