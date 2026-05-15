using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Invoices.GetInvoices
{
    public class GetInvoicesFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/projects/{projectId:int}/invoices", Handle)
                .WithName("GetInvoices")
                .WithTags("Invoices")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int projectId, IInvoiceService invoiceService, ICurrentUser currentUser)
        {
            var invoices = await invoiceService.GetByProjectAsync(projectId, currentUser.TenantId);
            
            var response = invoices.Select(invoice => new GetInvoicesResponse(
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
                invoice.LineItems.Select(li => new GetInvoicesLineItemResponse(
                    li.Id, li.TaskId, li.Description, li.Hours, li.HourlyRate, li.Hours * li.HourlyRate))
            ));

            return Results.Ok(response);
        }
    }

    public record GetInvoicesResponse(int Id, int ProjectId, string InvoiceNumber, string? CompanyName, string? ClientName, string? ClientAddress, DateTime? DueDate, decimal TaxRate, string? Notes, string Status, DateTime CreatedAt, IEnumerable<GetInvoicesLineItemResponse> LineItems);
    public record GetInvoicesLineItemResponse(int Id, int TaskId, string Description, decimal Hours, decimal HourlyRate, decimal Amount);
}
