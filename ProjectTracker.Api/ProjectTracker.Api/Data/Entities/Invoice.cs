namespace ProjectTracker.Api.Data.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? ClientName { get; set; }
        public string? ClientAddress { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal TaxRate { get; set; } = 0;
        public string? Notes { get; set; }
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Project Project { get; set; } = null!;
        public ICollection<InvoiceLineItem> LineItems { get; set; } = new List<InvoiceLineItem>();
    }
}
