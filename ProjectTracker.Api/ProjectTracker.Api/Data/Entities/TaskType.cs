namespace ProjectTracker.Api.Data.Entities
{
    public class TaskType
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int SortOrder { get; set; }

        public Tenant Tenant { get; set; } = null!;
    }
}
