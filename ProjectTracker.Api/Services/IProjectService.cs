using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services;

public record ProjectListItem(int Id, string Name, string? Description, DateTime CreatedAt, int TaskCount);

public interface IProjectService
{
    Task<IEnumerable<ProjectListItem>> GetAllAsync();
    Task<Project?> GetByIdAsync(int id);
    Task<Project> CreateAsync(string name, string? description);
    Task<Project?> UpdateAsync(int id, string name, string? description);
    Task<bool> DeleteAsync(int id);
}
