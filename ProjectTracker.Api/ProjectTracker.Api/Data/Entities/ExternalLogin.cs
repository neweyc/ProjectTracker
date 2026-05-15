namespace ProjectTracker.Api.Data.Entities
{
    /// <summary>Links a User to an OAuth provider identity (Google, GitHub, etc.).</summary>
    public class ExternalLogin
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        /// <summary>e.g. "google", "github"</summary>
        public string Provider { get; set; } = string.Empty;
        /// <summary>The provider's stable subject identifier ("sub" claim in OIDC).</summary>
        public string ProviderSubjectId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}
