using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Invoices.CreateInvoice
{
    public class CreateInvoiceFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/projects/{projectId:int}/invoices", Handle)
                .WithName("CreateInvoice")
                .WithTags("Invoices")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int projectId, CreateInvoiceRequest request, IInvoiceService invoiceService, ICurrentUser currentUser)
        {
            if (request.LineItems == null || !request.LineItems.Any())
                return Results.BadRequest("At least one line item is required.");

            var dtos = new CreateInvoiceDto(
                request.ClientName,
                request.ClientAddress,
                request.DueDate,
                request.TaxRate,
                request.Notes,
                request.LineItems.Select(li => new InvoiceLineItemDto(li.TaskId, li.HourlyRate))
            );
            
            var invoice = await invoiceService.CreateInvoiceAsync(projectId, dtos, currentUser.TenantId);
            if (invoice == null)
                return Results.BadRequest("Invalid tasks or tasks do not belong to the project.");

            var response = new CreateInvoiceResponse(
                invoice.Id,
                invoice.ProjectId,
                invoice.InvoiceNumber,
                invoice.CompanyName,
                invoice.ClientName,
                invoice.ClientAddress,
                invoice.DueDate,
                invoice.TaxRate,
                invoice.Notes,
                invoice.Status.ToString(),
                invoice.CreatedAt,
                invoice.LineItems.Select(li => new InvoiceLineItemResponse(
                    li.Id, li.TaskId, li.Description, li.Hours, li.HourlyRate, li.Hours * li.HourlyRate))
            );

            return Results.Created($"/api/projects/{projectId}/invoices", response);
        }
    }

    public record CreateInvoiceRequest(string? ClientName, string? ClientAddress, DateTime? DueDate, decimal TaxRate, string? Notes, IEnumerable<CreateInvoiceLineItemRequest> LineItems);
    public record CreateInvoiceLineItemRequest(int TaskId, decimal HourlyRate);

    public record CreateInvoiceResponse(int Id, int ProjectId, string InvoiceNumber, string? CompanyName, string? ClientName, string? ClientAddress, DateTime? DueDate, decimal TaxRate, string? Notes, string Status, DateTime CreatedAt, IEnumerable<InvoiceLineItemResponse> LineItems);
    public record InvoiceLineItemResponse(int Id, int TaskId, string Description, decimal Hours, decimal HourlyRate, decimal Amount);
}
