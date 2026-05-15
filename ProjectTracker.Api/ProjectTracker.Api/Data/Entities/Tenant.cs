namespace ProjectTracker.Api.Data.Entities
{
    public class Tenant
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? StripeCustomerId { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public string? SubscriptionStatus { get; set; }
        public string SubscriptionTier { get; set; } = "Free";

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<SystemSettings> SystemSettings { get; set; } = new List<SystemSettings>();
    }
}
