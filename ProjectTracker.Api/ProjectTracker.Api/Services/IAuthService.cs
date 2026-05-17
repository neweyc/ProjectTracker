using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public record RegisterInput(string TenantName, string Email, string DisplayName, string Password);
    public record LoginInput(string Email, string Password);
    public record AuthResult(int UserId, int TenantId, string Email, string DisplayName);

    public interface IAuthService
    {
        Task<(AuthResult? Result, string? Error)> RegisterAsync(RegisterInput input);
        Task<AuthResult?> LoginAsync(LoginInput input);
        Task<(User? User, string? Error)> AddUserToTenantAsync(int tenantId, string email, string displayName, string password);
    }

    public class AuthService(ProjectTrackerDbContext context, ITaskTypeService taskTypeService) : IAuthService
    {
        public async Task<(AuthResult? Result, string? Error)> RegisterAsync(RegisterInput input)
        {
            var email = input.Email.Trim().ToLowerInvariant();

            if (await context.Users.AnyAsync(u => u.Email == email))
                return (null, "Email is already registered.");

            var slug = ToSlug(input.TenantName);
            var candidate = slug;
            var i = 0;
            while (await context.Tenants.AnyAsync(t => t.Slug == candidate))
                candidate = $"{slug}-{++i}";

            var tenant = new Tenant 
            { 
                Name = input.TenantName.Trim(), 
                Slug = candidate, 
                CreatedAt = DateTime.UtcNow,
                SubscriptionTier = "Free" 
            };
            context.Tenants.Add(tenant);
            
            // Create default settings for the new tenant
            context.SystemSettings.Add(new SystemSettings 
            { 
                Tenant = tenant, 
                NextInvoiceSequence = 1 
            });

            await context.SaveChangesAsync();
            await taskTypeService.SeedDefaultsAsync(tenant.Id);

            var user = new User
            {
                TenantId = tenant.Id,
                Email = email,
                DisplayName = input.DisplayName.Trim(),
                PasswordHash = HashPassword(input.Password),
                CreatedAt = DateTime.UtcNow,
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            return (new AuthResult(user.Id, tenant.Id, user.Email, user.DisplayName), null);
        }

        public async Task<(User? User, string? Error)> AddUserToTenantAsync(int tenantId, string email, string displayName, string password)
        {
            var tenant = await context.Tenants
                .Include(t => t.Users)
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null) return (null, "Tenant not found.");

            var maxUsers = tenant.SubscriptionTier switch
            {
                "Team" => 5,
                "Pro" => 5,
                _ => 1
            };

            if (tenant.Users.Count >= maxUsers)
            {
                var message = tenant.SubscriptionTier == "Team" 
                    ? "Team plan is limited to 5 users." 
                    : "Solo and Free plans are limited to 1 user. Please upgrade to Team.";
                return (null, message);
            }

            var normalizedEmail = email.Trim().ToLowerInvariant();
            if (await context.Users.AnyAsync(u => u.Email == normalizedEmail))
                return (null, "Email is already registered.");

            var user = new User
            {
                TenantId = tenantId,
                Email = normalizedEmail,
                DisplayName = displayName.Trim(),
                PasswordHash = HashPassword(password),
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return (user, null);
        }

        public async Task<AuthResult?> LoginAsync(LoginInput input)
        {
            var email = input.Email.Trim().ToLowerInvariant();
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user is null || user.PasswordHash is null)
                return null;

            if (!VerifyPassword(input.Password, user.PasswordHash))
                return null;

            return new AuthResult(user.Id, user.TenantId, user.Email, user.DisplayName);
        }

        private static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        private static bool VerifyPassword(string password, string stored)
        {
            var parts = stored.Split(':');
            if (parts.Length != 2) return false;
            var salt = Convert.FromBase64String(parts[0]);
            var expected = Convert.FromBase64String(parts[1]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }

        private static string ToSlug(string name) =>
            Regex.Replace(name.Trim().ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
    }
}
