using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;
using Stripe;

namespace ProjectTracker.Api
{
    public static class Init
    {
        public static void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration["DB_CONNECTION_STRING"] 
                ?? configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string is not configured.");

            services.AddDbContext<ProjectTrackerDbContext>(options =>
            {
                options.UseNpgsql(connectionString)
                       .UseSnakeCaseNamingConvention();
            });

            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUser, CurrentUser>();
            services.AddScoped<IAuthService, AuthService>();

            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<IClientService, ClientService>();
            services.AddScoped<ITaskService, TaskService>();
            services.AddScoped<ITimeEntryService, TimeEntryService>();
            services.AddScoped<ISettingsService, SettingsService>();
            services.AddScoped<IInvoiceService, ProjectTracker.Api.Services.InvoiceService>();
            services.AddScoped<IBillingService, ProjectTracker.Api.Services.BillingService>();
            services.AddScoped<ITaskTypeService, TaskTypeService>();

            StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];

            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.Cookie.Name = "olive.auth";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                    options.ExpireTimeSpan = TimeSpan.FromDays(30);
                    options.SlidingExpiration = true;
                    options.Events.OnRedirectToLogin = ctx =>
                    {
                        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    };
                    options.Events.OnRedirectToAccessDenied = ctx =>
                    {
                        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    };
                });

            services.AddAuthorization();
        }

        public static async Task InitializeDatabaseAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProjectTrackerDbContext>();
           // await context.Database.MigrateAsync();
        }

        public static void ConfigureEndpoints(WebApplication app)
        {
            var endpointServiceType = typeof(IEndpoint);
            var endpointServices = typeof(Program).Assembly.GetTypes()
                .Where(type => endpointServiceType.IsAssignableFrom(type) && !type.IsInterface);
            foreach (var endpointService in endpointServices)
            {
                IEndpoint? ep = (IEndpoint?)Activator.CreateInstance(endpointService);
                if (ep != null)
                {
                    ep.MapEndpoint(app);
                }
            }
        }
    }
}
