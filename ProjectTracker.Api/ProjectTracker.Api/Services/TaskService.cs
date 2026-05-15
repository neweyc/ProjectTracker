using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class TaskService(ProjectTrackerDbContext context) : ITaskService
    {
        public async Task<IEnumerable<ProjectTask>> GetTopLevelByProjectAsync(int projectId, int tenantId)
            => await context.Tasks
                .Where(t => t.ProjectId == projectId && t.Project.TenantId == tenantId && t.ParentTaskId == null)
                .Include(t => t.SubTasks)
                .Include(t => t.TimeEntries)
                .AsNoTracking()
                .ToListAsync();

        public async Task<ProjectTask?> GetByIdAsync(int id, int tenantId)
            => await context.Tasks
                .Include(t => t.SubTasks)
                .Include(t => t.TimeEntries)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id && t.Project.TenantId == tenantId);

        public async Task<bool> ProjectExistsAsync(int projectId, int tenantId)
            => await context.Projects.AnyAsync(p => p.Id == projectId && p.TenantId == tenantId);

        public async Task<ProjectTask?> CreateAsync(int projectId, int? parentTaskId, string title, string? description, int tenantId)
        {
            if (!await ProjectExistsAsync(projectId, tenantId))
                return null;

            if (parentTaskId.HasValue)
            {
                var parent = await context.Tasks.FindAsync(parentTaskId.Value);
                if (parent is null || parent.ProjectId != projectId || parent.ParentTaskId is not null)
                    return null;
            }

            var task = new ProjectTask
            {
                ProjectId = projectId,
                ParentTaskId = parentTaskId,
                Title = title,
                Description = description,
                Status = ProjectTaskStatus.Created,
                CreatedAt = DateTime.UtcNow,
            };
            context.Tasks.Add(task);
            await context.SaveChangesAsync();
            return task;
        }

        public async Task<ProjectTask?> UpdateAsync(int id, string title, string? description, bool isInvoiced, int tenantId)
        {
            var task = await context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.Project.TenantId == tenantId);
            if (task is null) return null;
            task.Title = title;
            task.Description = description;
            task.IsInvoiced = isInvoiced;
            await context.SaveChangesAsync();
            return task;
        }

        public async Task<ProjectTask?> UpdateStatusAsync(int id, ProjectTaskStatus status, int tenantId)
        {
            var task = await context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.Project.TenantId == tenantId);
            if (task is null) return null;
            task.Status = status;
            await context.SaveChangesAsync();
            return task;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var task = await context.Tasks
                .Include(t => t.SubTasks)
                .FirstOrDefaultAsync(t => t.Id == id && t.Project.TenantId == tenantId);
            if (task is null) return false;

            if (task.SubTasks.Any())
                context.Tasks.RemoveRange(task.SubTasks);

            context.Tasks.Remove(task);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
