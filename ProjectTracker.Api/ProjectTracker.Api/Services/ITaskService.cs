using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<ProjectTask>> GetTopLevelByProjectAsync(int projectId, int tenantId);
        Task<ProjectTask?> GetByIdAsync(int id, int tenantId);
        Task<bool> ProjectExistsAsync(int projectId, int tenantId);
        Task<ProjectTask?> CreateAsync(int projectId, int? parentTaskId, string title, string? description, int tenantId);
        Task<ProjectTask?> UpdateAsync(int id, string title, string? description, bool isInvoiced, int tenantId);
        Task<ProjectTask?> UpdateStatusAsync(int id, ProjectTaskStatus status, int tenantId);
        Task<bool> DeleteAsync(int id, int tenantId);
    }
}
