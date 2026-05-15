namespace ProjectTracker.Api.Data.Entities
{
    public class InvoiceLineItem
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public int TaskId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Hours { get; set; }
        public decimal HourlyRate { get; set; }

        public Invoice Invoice { get; set; } = null!;
        public ProjectTask Task { get; set; } = null!;
    }
}
