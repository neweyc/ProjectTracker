using System;
using System.Collections.Generic;

namespace ProjectTracker.Api.Data.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Tenant Tenant { get; set; } = null!;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
