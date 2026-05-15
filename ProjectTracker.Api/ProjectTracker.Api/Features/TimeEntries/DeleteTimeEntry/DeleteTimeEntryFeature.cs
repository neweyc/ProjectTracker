using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TimeEntries.DeleteTimeEntry
{
    public class DeleteTimeEntryFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/api/time-entries/{id:int}", Handle)
                .WithName("DeleteTimeEntry")
                .WithTags("TimeEntries")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int id, ITimeEntryService timeEntryService, ICurrentUser currentUser)
        {
            var deleted = await timeEntryService.DeleteAsync(id, currentUser.TenantId);
            return deleted ? Results.NoContent() : Results.NotFound();
        }
    }
}
