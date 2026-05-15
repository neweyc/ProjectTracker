using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services;

public interface ITimeEntryService
{
    Task<IEnumerable<TimeEntry>> GetByTaskAsync(int taskId);
    Task<TimeEntry?> LogAsync(int taskId, decimal hours, DateTime date, string? notes);
    Task<bool> DeleteAsync(int id);
}
