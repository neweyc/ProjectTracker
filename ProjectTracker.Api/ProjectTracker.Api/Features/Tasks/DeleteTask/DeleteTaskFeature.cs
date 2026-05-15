using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Tasks.DeleteTask
{
    public class DeleteTaskFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/api/tasks/{id:int}", Handle)
                .WithName("DeleteTask")
                .WithTags("Tasks")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, ITaskService taskService, ICurrentUser currentUser)
        {
            var deleted = await taskService.DeleteAsync(id, currentUser.TenantId);
            return deleted ? Results.NoContent() : Results.NotFound();
        }
    }
}
