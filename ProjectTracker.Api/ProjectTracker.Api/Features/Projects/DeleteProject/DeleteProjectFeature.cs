using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Projects.DeleteProject
{
    public class DeleteProjectFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/api/projects/{id:int}", Handle)
                .WithName("DeleteProject")
                .WithTags("Projects")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, IProjectService projectService, ICurrentUser currentUser)
        {
            var deleted = await projectService.DeleteAsync(id, currentUser.TenantId);
            return deleted ? Results.NoContent() : Results.NotFound();
        }
    }
}
