using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Invoices.DeleteInvoice
{
    public class DeleteInvoiceFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/api/projects/{projectId:int}/invoices/{invoiceId:int}", Handle)
                .WithName("DeleteInvoice")
                .WithTags("Invoices")
                .RequireAuthorization();
        }

        private static async Task<IResult> Handle(int projectId, int invoiceId, IInvoiceService invoiceService, ICurrentUser currentUser)
        {
            var success = await invoiceService.DeleteInvoiceAsync(projectId, invoiceId, currentUser.TenantId);
            if (!success) return Results.NotFound();

            return Results.NoContent();
        }
    }
}
