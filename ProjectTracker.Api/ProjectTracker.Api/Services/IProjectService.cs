using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public record ProjectListItem(int Id, string Name, string? Description, DateTime CreatedAt, int TaskCount, int? ClientId = null);

    public interface IProjectService
    {
        Task<IEnumerable<ProjectListItem>> GetAllAsync(int tenantId);
        Task<int> CountAsync(int tenantId);
        Task<Project?> GetByIdAsync(int id, int tenantId);
        Task<Project> CreateAsync(string name, string? description, int tenantId);
        Task<Project> CreateWithClientAsync(string name, string? description, int? clientId, int tenantId);
        Task<Project?> UpdateAsync(int id, string name, string? description, int tenantId);
        Task<Project?> UpdateWithClientAsync(int id, string name, string? description, int? clientId, int tenantId);
        Task<bool> DeleteAsync(int id, int tenantId);
    }
}
