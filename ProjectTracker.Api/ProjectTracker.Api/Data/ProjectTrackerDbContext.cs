using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Data
{
    public class ProjectTrackerDbContext(DbContextOptions<ProjectTrackerDbContext> options) : DbContext(options)
    {
        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<User> Users => Set<User>();
        public DbSet<ExternalLogin> ExternalLogins => Set<ExternalLogin>();
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
        public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();
        public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceLineItem> InvoiceLineItems => Set<InvoiceLineItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tenant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.Property(e => e.StripeCustomerId).HasMaxLength(100);
                entity.Property(e => e.StripeSubscriptionId).HasMaxLength(100);
                entity.Property(e => e.SubscriptionStatus).HasMaxLength(50);
                entity.Property(e => e.SubscriptionTier).IsRequired().HasMaxLength(50).HasDefaultValue("Free");
                entity.HasIndex(e => e.Slug).IsUnique();
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
                entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.PasswordHash).HasMaxLength(500);
                entity.HasIndex(e => e.Email).IsUnique();

                entity.HasOne(e => e.Tenant)
                    .WithMany(e => e.Users)
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ExternalLogin>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Provider).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ProviderSubjectId).IsRequired().HasMaxLength(256);
                entity.HasIndex(e => new { e.Provider, e.ProviderSubjectId }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany(e => e.ExternalLogins)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).HasMaxLength(256);
                entity.Property(e => e.Address).HasMaxLength(1000);

                entity.HasOne(e => e.Tenant)
                    .WithMany()
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(2000);

                entity.HasOne(e => e.Tenant)
                    .WithMany(e => e.Projects)
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Client)
                    .WithMany(e => e.Projects)
                    .HasForeignKey(e => e.ClientId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<ProjectTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Description).HasMaxLength(4000);
                entity.Property(e => e.Status).HasConversion<string>();

                entity.HasOne(e => e.Project)
                    .WithMany(e => e.Tasks)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ParentTask)
                    .WithMany(e => e.SubTasks)
                    .HasForeignKey(e => e.ParentTaskId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TimeEntry>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Hours).HasColumnType("decimal(10,2)");

                entity.HasOne(e => e.Task)
                    .WithMany(e => e.TimeEntries)
                    .HasForeignKey(e => e.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SystemSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompanyName).HasMaxLength(200);
                entity.Property(e => e.CompanyAddress).HasMaxLength(1000);

                entity.HasOne(e => e.Tenant)
                    .WithMany(e => e.SystemSettings)
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CompanyName).HasMaxLength(200);
                entity.Property(e => e.ClientName).HasMaxLength(200);
                entity.Property(e => e.ClientAddress).HasMaxLength(1000);
                entity.Property(e => e.TaxRate).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Status).HasConversion<string>();

                entity.HasOne(e => e.Project)
                    .WithMany(e => e.Invoices)
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<InvoiceLineItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Hours).HasColumnType("decimal(10,2)");
                entity.Property(e => e.HourlyRate).HasColumnType("decimal(10,2)");

                entity.HasOne(e => e.Invoice)
                    .WithMany(e => e.LineItems)
                    .HasForeignKey(e => e.InvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Task)
                    .WithMany(e => e.InvoiceLineItems)
                    .HasForeignKey(e => e.TaskId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
