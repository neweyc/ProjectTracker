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
    }

    public class AuthService(ProjectTrackerDbContext context) : IAuthService
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

            var tenant = new Tenant { Name = input.TenantName.Trim(), Slug = candidate, CreatedAt = DateTime.UtcNow };
            context.Tenants.Add(tenant);
            await context.SaveChangesAsync();

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
