using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services;

public class ProjectService(ProjectTrackerDbContext context) : IProjectService
{
    public async Task<IEnumerable<ProjectListItem>> GetAllAsync()
        => await context.Projects
            .AsNoTracking()
            .Select(p => new ProjectListItem(
                p.Id,
                p.Name,
                p.Description,
                p.CreatedAt,
                p.Tasks.Count(t => t.ParentTaskId == null)))
            .ToListAsync();

    public async Task<Project?> GetByIdAsync(int id)
        => await context.Projects
            .Include(p => p.Tasks.Where(t => t.ParentTaskId == null))
                .ThenInclude(t => t.SubTasks)
            .Include(p => p.Tasks.Where(t => t.ParentTaskId == null))
                .ThenInclude(t => t.TimeEntries)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Project> CreateAsync(string name, string? description)
    {
        var project = new Project { Name = name, Description = description, CreatedAt = DateTime.UtcNow };
        context.Projects.Add(project);
        await context.SaveChangesAsync();
        return project;
    }

    public async Task<Project?> UpdateAsync(int id, string name, string? description)
    {
        var project = await context.Projects.FindAsync(id);
        if (project is null) return null;
        project.Name = name;
        project.Description = description;
        await context.SaveChangesAsync();
        return project;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await context.Projects.FindAsync(id);
        if (project is null) return false;
        context.Projects.Remove(project);
        await context.SaveChangesAsync();
        return true;
    }
}
