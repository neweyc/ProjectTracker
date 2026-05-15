using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services;

public class TaskService(ProjectTrackerDbContext context) : ITaskService
{
    public async Task<IEnumerable<ProjectTask>> GetTopLevelByProjectAsync(int projectId)
        => await context.Tasks
            .Where(t => t.ProjectId == projectId && t.ParentTaskId == null)
            .Include(t => t.SubTasks)
            .Include(t => t.TimeEntries)
            .AsNoTracking()
            .ToListAsync();

    public async Task<ProjectTask?> GetByIdAsync(int id)
        => await context.Tasks
            .Include(t => t.SubTasks)
            .Include(t => t.TimeEntries)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<bool> ProjectExistsAsync(int projectId)
        => await context.Projects.AnyAsync(p => p.Id == projectId);

    public async Task<ProjectTask?> CreateAsync(int projectId, int? parentTaskId, string title, string? description)
    {
        if (parentTaskId.HasValue)
        {
            var parent = await context.Tasks.FindAsync(parentTaskId.Value);
            if (parent is null || parent.ParentTaskId is not null)
                return null;
        }

        var task = new ProjectTask
        {
            ProjectId = projectId,
            ParentTaskId = parentTaskId,
            Title = title,
            Description = description,
            Status = ProjectTaskStatus.Created,
            CreatedAt = DateTime.UtcNow
        };
        context.Tasks.Add(task);
        await context.SaveChangesAsync();
        return task;
    }

    public async Task<ProjectTask?> UpdateAsync(int id, string title, string? description, bool isInvoiced)
    {
        var task = await context.Tasks.FindAsync(id);
        if (task is null) return null;
        task.Title = title;
        task.Description = description;
        task.IsInvoiced = isInvoiced;
        await context.SaveChangesAsync();
        return task;
    }

    public async Task<ProjectTask?> UpdateStatusAsync(int id, ProjectTaskStatus status)
    {
        var task = await context.Tasks.FindAsync(id);
        if (task is null) return null;
        task.Status = status;
        await context.SaveChangesAsync();
        return task;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await context.Tasks
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (task is null) return false;

        if (task.SubTasks.Any())
            context.Tasks.RemoveRange(task.SubTasks);

        context.Tasks.Remove(task);
        await context.SaveChangesAsync();
        return true;
    }
}
