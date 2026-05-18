using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public interface IInvoiceService
    {
        Task<IEnumerable<Invoice>> GetByProjectAsync(int projectId, int tenantId);
        Task<int> CountAllAsync(int tenantId);
        Task<Invoice?> GetByIdAsync(int projectId, int invoiceId, int tenantId);
        Task<Invoice?> CreateInvoiceAsync(int projectId, CreateInvoiceDto dto, int tenantId);
        Task<Invoice?> UpdateInvoiceAsync(int projectId, int invoiceId, UpdateInvoiceDto dto, int tenantId);
        Task<bool> DeleteInvoiceAsync(int projectId, int invoiceId, int tenantId);
    }

    public record InvoiceLineItemDto(int TaskId, decimal HourlyRate);

    public record CreateInvoiceDto(
        string? ClientName,
        string? ClientAddress,
        DateTime? DueDate,
        decimal TaxRate,
        string? Notes,
        IEnumerable<InvoiceLineItemDto> LineItems
    );

    public record UpdateInvoiceDto(
        string? ClientName,
        string? ClientAddress,
        DateTime? DueDate,
        decimal TaxRate,
        string? Notes,
        InvoiceStatus Status
    );
}
