using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api;

public static class Init
{
    public static void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=projecttracker.db";

        services.AddDbContext<ProjectTrackerDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<ITimeEntryService, TimeEntryService>();
    }
}
