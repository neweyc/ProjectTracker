using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class TaskTypeService(ProjectTrackerDbContext context) : ITaskTypeService
    {
        public async Task<IEnumerable<TaskType>> GetByTenantAsync(int tenantId)
            => await context.TaskTypes
                .Where(t => t.TenantId == tenantId)
                .OrderBy(t => t.SortOrder)
                .ThenBy(t => t.Id)
                .AsNoTracking()
                .ToListAsync();

        public async Task<TaskType> CreateAsync(int tenantId, TaskTypeInput input)
        {
            var maxOrder = await context.TaskTypes
                .Where(t => t.TenantId == tenantId)
                .Select(t => (int?)t.SortOrder)
                .MaxAsync() ?? -1;

            var taskType = new TaskType
            {
                TenantId = tenantId,
                Name = input.Name.Trim(),
                Color = input.Color,
                SortOrder = maxOrder + 1,
            };
            context.TaskTypes.Add(taskType);
            await context.SaveChangesAsync();
            return taskType;
        }

        public async Task<TaskType?> UpdateAsync(int id, int tenantId, TaskTypeInput input)
        {
            var taskType = await context.TaskTypes
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId);
            if (taskType is null) return null;

            taskType.Name = input.Name.Trim();
            taskType.Color = input.Color;
            await context.SaveChangesAsync();
            return taskType;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var taskType = await context.TaskTypes
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId);
            if (taskType is null) return false;

            context.TaskTypes.Remove(taskType);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task SeedDefaultsAsync(int tenantId)
        {
            var defaults = new[]
            {
                new TaskType { TenantId = tenantId, Name = "Feature", Color = "#7c3aed", SortOrder = 0 },
                new TaskType { TenantId = tenantId, Name = "Bug",     Color = "#dc2626", SortOrder = 1 },
            };
            context.TaskTypes.AddRange(defaults);
            await context.SaveChangesAsync();
        }
    }
}
