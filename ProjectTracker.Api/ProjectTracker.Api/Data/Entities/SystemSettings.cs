namespace ProjectTracker.Api.Data.Entities
{
    public class SystemSettings
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public int NextInvoiceSequence { get; set; } = 1;

        public Tenant Tenant { get; set; } = null!;
    }
}
