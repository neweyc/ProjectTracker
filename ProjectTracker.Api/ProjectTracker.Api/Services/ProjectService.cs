using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class ProjectService(ProjectTrackerDbContext context) : IProjectService
    {
        public async Task<IEnumerable<ProjectListItem>> GetAllAsync(int tenantId)
            => await context.Projects
                .Where(p => p.TenantId == tenantId)
                .AsNoTracking()
                .Select(p => new ProjectListItem(
                    p.Id, p.Name, p.Description, p.CreatedAt,
                    p.Tasks.Count(t => t.ParentTaskId == null),
                    p.ClientId))
                .ToListAsync();

        public async Task<Project?> GetByIdAsync(int id, int tenantId)
            => await context.Projects
                .Include(p => p.Tasks.Where(t => t.ParentTaskId == null))
                    .ThenInclude(t => t.SubTasks)
                .Include(p => p.Tasks.Where(t => t.ParentTaskId == null))
                    .ThenInclude(t => t.TimeEntries)
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);

        public async Task<Project> CreateAsync(string name, string? description, int tenantId)
        {
            var project = new Project { TenantId = tenantId, Name = name, Description = description, CreatedAt = DateTime.UtcNow };
            context.Projects.Add(project);
            await context.SaveChangesAsync();
            return project;
        }

        public async Task<Project> CreateWithClientAsync(string name, string? description, int? clientId, int tenantId)
        {
            var project = new Project 
            { 
                TenantId = tenantId, 
                Name = name, 
                Description = description, 
                ClientId = clientId,
                CreatedAt = DateTime.UtcNow 
            };
            context.Projects.Add(project);
            await context.SaveChangesAsync();
            return project;
        }

        public async Task<Project?> UpdateAsync(int id, string name, string? description, int tenantId)
        {
            var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (project is null) return null;
            project.Name = name;
            project.Description = description;
            await context.SaveChangesAsync();
            return project;
        }

        public async Task<Project?> UpdateWithClientAsync(int id, string name, string? description, int? clientId, int tenantId)
        {
            var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (project is null) return null;
            project.Name = name;
            project.Description = description;
            project.ClientId = clientId;
            await context.SaveChangesAsync();
            return project;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (project is null) return false;
            context.Projects.Remove(project);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
