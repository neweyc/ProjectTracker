using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class TimeEntryService(ProjectTrackerDbContext context) : ITimeEntryService
    {
        public async Task<IEnumerable<TimeEntry>> GetByTaskAsync(int taskId, int tenantId)
            => await context.TimeEntries
                .Where(e => e.TaskId == taskId && e.Task.Project.TenantId == tenantId)
                .OrderByDescending(e => e.Date)
                .AsNoTracking()
                .ToListAsync();

        public async Task<TimeEntry?> LogAsync(int taskId, int tenantId, decimal hours, DateTime date, string? notes)
        {
            var task = await context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.TenantId == tenantId);

            if (task is null || task.ParentTaskId is not null) return null;

            var entry = new TimeEntry
            {
                TaskId = taskId,
                Hours = hours,
                Date = date.Date,
                Notes = notes,
                CreatedAt = DateTime.UtcNow,
            };
            context.TimeEntries.Add(entry);
            await context.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var entry = await context.TimeEntries
                .FirstOrDefaultAsync(e => e.Id == id && e.Task.Project.TenantId == tenantId);
            if (entry is null) return false;
            context.TimeEntries.Remove(entry);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
