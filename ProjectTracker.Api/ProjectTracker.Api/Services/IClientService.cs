using System.Collections.Generic;
using System.Threading.Tasks;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public interface IClientService
    {
        Task<IEnumerable<Client>> GetAllAsync(int tenantId);
        Task<int> CountAsync(int tenantId);
        Task<Client?> GetByIdAsync(int id, int tenantId);
        Task<Client> CreateAsync(string name, string? email, string? address, int tenantId);
        Task<Client?> UpdateAsync(int id, string name, string? email, string? address, int tenantId);
        Task<bool> DeleteAsync(int id, int tenantId);
    }
}
