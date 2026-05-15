using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services;

public class TimeEntryService(ProjectTrackerDbContext context) : ITimeEntryService
{
    public async Task<IEnumerable<TimeEntry>> GetByTaskAsync(int taskId)
        => await context.TimeEntries
            .Where(e => e.TaskId == taskId)
            .OrderByDescending(e => e.Date)
            .AsNoTracking()
            .ToListAsync();

    public async Task<TimeEntry?> LogAsync(int taskId, decimal hours, DateTime date, string? notes)
    {
        var task = await context.Tasks.FindAsync(taskId);
        if (task is null || task.ParentTaskId is not null) return null;

        var entry = new TimeEntry
        {
            TaskId = taskId,
            Hours = hours,
            Date = date.Date,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };
        context.TimeEntries.Add(entry);
        await context.SaveChangesAsync();
        return entry;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entry = await context.TimeEntries.FindAsync(id);
        if (entry is null) return false;
        context.TimeEntries.Remove(entry);
        await context.SaveChangesAsync();
        return true;
    }
}
