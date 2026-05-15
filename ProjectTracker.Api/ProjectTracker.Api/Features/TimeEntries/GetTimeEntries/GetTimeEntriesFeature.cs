using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TimeEntries.GetTimeEntries
{
    public class GetTimeEntriesFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/tasks/{taskId:int}/time-entries", Handle)
                .WithName("GetTimeEntries")
                .WithTags("TimeEntries")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int taskId, ITimeEntryService timeEntryService, ICurrentUser currentUser)
        {
            var entries = await timeEntryService.GetByTaskAsync(taskId, currentUser.TenantId);
            var response = entries.Select(e => new GetTimeEntriesResponse(
                e.Id, e.TaskId, e.Hours, e.Date, e.Notes, e.CreatedAt));
            return Results.Ok(response);
        }
    }

    public record GetTimeEntriesResponse(int Id, int TaskId, decimal Hours, DateTime Date, string? Notes, DateTime CreatedAt);
}
