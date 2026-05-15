using ProjectTracker.Api.Data.Entities;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Invoices.UpdateInvoice
{
    public class UpdateInvoiceFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/api/projects/{projectId:int}/invoices/{invoiceId:int}", Handle)
                .WithName("UpdateInvoice")
                .WithTags("Invoices")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int projectId, int invoiceId, UpdateInvoiceRequest request, IInvoiceService invoiceService, ICurrentUser currentUser)
        {
            if (!Enum.TryParse<InvoiceStatus>(request.Status, true, out var status))
                return Results.BadRequest("Invalid status.");

            var dto = new UpdateInvoiceDto(
                request.ClientName,
                request.ClientAddress,
                request.DueDate,
                request.TaxRate,
                request.Notes,
                status
            );

            var invoice = await invoiceService.UpdateInvoiceAsync(projectId, invoiceId, dto, currentUser.TenantId);
            if (invoice == null) return Results.NotFound();

            return Results.NoContent();
        }
    }

    public record UpdateInvoiceRequest(
        string? ClientName,
        string? ClientAddress,
        DateTime? DueDate,
        decimal TaxRate,
        string? Notes,
        string Status
    );
}
