using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services;

public interface ITaskService
{
    Task<IEnumerable<ProjectTask>> GetTopLevelByProjectAsync(int projectId);
    Task<ProjectTask?> GetByIdAsync(int id);
    Task<bool> ProjectExistsAsync(int projectId);
    Task<ProjectTask?> CreateAsync(int projectId, int? parentTaskId, string title, string? description);
    Task<ProjectTask?> UpdateAsync(int id, string title, string? description, bool isInvoiced);
    Task<ProjectTask?> UpdateStatusAsync(int id, ProjectTaskStatus status);
    Task<bool> DeleteAsync(int id);
}
