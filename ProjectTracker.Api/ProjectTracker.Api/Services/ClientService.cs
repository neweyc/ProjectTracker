using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class ClientService(ProjectTrackerDbContext context) : IClientService
    {
        public Task<int> CountAsync(int tenantId)
            => context.Clients.CountAsync(c => c.TenantId == tenantId);

        public async Task<IEnumerable<Client>> GetAllAsync(int tenantId)
            => await context.Clients
                .Where(c => c.TenantId == tenantId)
                .OrderBy(c => c.Name)
                .AsNoTracking()
                .ToListAsync();

        public async Task<Client?> GetByIdAsync(int id, int tenantId)
            => await context.Clients
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        public async Task<Client> CreateAsync(string name, string? email, string? address, int tenantId)
        {
            var client = new Client
            {
                TenantId = tenantId,
                Name = name.Trim(),
                Email = email?.Trim(),
                Address = address?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            context.Clients.Add(client);
            await context.SaveChangesAsync();
            return client;
        }

        public async Task<Client?> UpdateAsync(int id, string name, string? email, string? address, int tenantId)
        {
            var client = await context.Clients
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

            if (client == null) return null;

            client.Name = name.Trim();
            client.Email = email?.Trim();
            client.Address = address?.Trim();

            await context.SaveChangesAsync();
            return client;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var client = await context.Clients
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

            if (client == null) return false;

            context.Clients.Remove(client);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
