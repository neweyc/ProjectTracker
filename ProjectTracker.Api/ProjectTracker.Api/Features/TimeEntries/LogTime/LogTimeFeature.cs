using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.TimeEntries.LogTime
{
    public class LogTimeFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/tasks/{taskId:int}/time-entries", Handle)
                .WithName("LogTime")
                .WithTags("TimeEntries")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int taskId, LogTimeRequest request, ITimeEntryService timeEntryService, ICurrentUser currentUser)
        {
            if (request.Hours <= 0)
                return Results.BadRequest("Hours must be greater than zero.");

            var entry = await timeEntryService.LogAsync(taskId, currentUser.TenantId, request.Hours, request.Date, request.Notes?.Trim());
            if (entry is null)
                return Results.BadRequest("Time can only be logged against top-level tasks. The task must exist and must not be a subtask.");

            return Results.Created($"/api/tasks/{taskId}/time-entries",
                new LogTimeResponse(entry.Id, entry.TaskId, entry.Hours, entry.Date, entry.Notes, entry.CreatedAt));
        }
    }

    public record LogTimeRequest(decimal Hours, DateTime Date, string? Notes);
    public record LogTimeResponse(int Id, int TaskId, decimal Hours, DateTime Date, string? Notes, DateTime CreatedAt);
}
