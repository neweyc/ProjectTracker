using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;
using ProjectTracker.Api.Features.Settings.GetSettings;

namespace ProjectTracker.Api.Features.Settings.UpdateSettings
{
    public class UpdateSettingsFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/api/settings", Handle)
                .WithName("UpdateSettings")
                .WithTags("Settings")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(UpdateSettingsRequest request, ISettingsService settingsService, ICurrentUser currentUser)
        {
            if (request.NextInvoiceSequence < 1)
                return Results.BadRequest("NextInvoiceSequence must be greater than or equal to 1.");

            var settings = await settingsService.UpdateSettingsAsync(request.CompanyName, request.CompanyAddress, request.NextInvoiceSequence, currentUser.TenantId);
            return Results.Ok(new SettingsResponse(settings.CompanyName, settings.CompanyAddress, settings.NextInvoiceSequence));
        }
    }

    public record UpdateSettingsRequest(string? CompanyName, string? CompanyAddress, int NextInvoiceSequence);
}
