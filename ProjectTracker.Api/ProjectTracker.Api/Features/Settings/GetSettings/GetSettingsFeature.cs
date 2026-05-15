using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Settings.GetSettings
{
    public class GetSettingsFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/settings", Handle)
                .WithName("GetSettings")
                .WithTags("Settings")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(ISettingsService settingsService, ICurrentUser currentUser)
        {
            var settings = await settingsService.GetSettingsAsync(currentUser.TenantId);
            return Results.Ok(new SettingsResponse(settings.CompanyName, settings.CompanyAddress, settings.NextInvoiceSequence));
        }
    }

    public record SettingsResponse(string? CompanyName, string? CompanyAddress, int NextInvoiceSequence);
}
