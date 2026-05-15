using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public interface ITimeEntryService
    {
        Task<IEnumerable<TimeEntry>> GetByTaskAsync(int taskId, int tenantId);
        Task<TimeEntry?> LogAsync(int taskId, int tenantId, decimal hours, DateTime date, string? notes);
        Task<bool> DeleteAsync(int id, int tenantId);
    }
}
