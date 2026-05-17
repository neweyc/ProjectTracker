using System.Diagnostics;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Routing;

namespace ProjectTracker.Api.Features.Health
{
    public class HealthFeature : IEndpoint
    {
        private static readonly DateTime _startTime = Process.GetCurrentProcess().StartTime.ToUniversalTime();

        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/health", Handle)
                .WithName("Health")
                .WithTags("Health")
                .AllowAnonymous();
        }

        private static async Task<IResult> Handle(
            ProjectTrackerDbContext context,
            IWebHostEnvironment env)
        {
            var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "unknown";
            var uptime = DateTime.UtcNow - _startTime;

            var dbCheck = await CheckDatabaseAsync(context);

            var overall = dbCheck.Status == "healthy" ? "healthy" : "degraded";

            var response = new HealthResponse(
                Status: overall,
                Version: version,
                Environment: env.EnvironmentName,
                Timestamp: DateTime.UtcNow,
                UptimeSeconds: (long)uptime.TotalSeconds,
                Checks: new HealthChecks(Database: dbCheck)
            );

            return overall == "healthy"
                ? Results.Ok(response)
                : Results.Json(response, statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        private static async Task<CheckResult> CheckDatabaseAsync(ProjectTrackerDbContext context)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                await context.Database.ExecuteSqlRawAsync("SELECT 1");
                sw.Stop();
                return new CheckResult(Status: "healthy", LatencyMs: sw.ElapsedMilliseconds, Error: null);
            }
            catch (Exception ex)
            {
                sw.Stop();
                return new CheckResult(Status: "unhealthy", LatencyMs: sw.ElapsedMilliseconds, Error: ex.Message);
            }
        }
    }

    public record HealthResponse(
        string Status,
        string Version,
        string Environment,
        DateTime Timestamp,
        long UptimeSeconds,
        HealthChecks Checks);

    public record HealthChecks(CheckResult Database);

    public record CheckResult(string Status, long LatencyMs, string? Error);
}
