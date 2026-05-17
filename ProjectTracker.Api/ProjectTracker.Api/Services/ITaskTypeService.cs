using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public record TaskTypeInput(string Name, string Color);

    public interface ITaskTypeService
    {
        Task<IEnumerable<TaskType>> GetByTenantAsync(int tenantId);
        Task<TaskType> CreateAsync(int tenantId, TaskTypeInput input);
        Task<TaskType?> UpdateAsync(int id, int tenantId, TaskTypeInput input);
        Task<bool> DeleteAsync(int id, int tenantId);
        Task SeedDefaultsAsync(int tenantId);
    }
}
