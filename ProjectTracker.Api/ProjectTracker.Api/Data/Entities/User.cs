namespace ProjectTracker.Api.Data.Entities
{
    public class User
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        /// <summary>Null for OAuth-only users who have never set a password.</summary>
        public string? PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Tenant Tenant { get; set; } = null!;
        public ICollection<ExternalLogin> ExternalLogins { get; set; } = new List<ExternalLogin>();
    }
}
