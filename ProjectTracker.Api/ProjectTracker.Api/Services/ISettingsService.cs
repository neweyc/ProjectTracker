using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public interface ISettingsService
    {
        Task<SystemSettings> GetSettingsAsync(int tenantId);
        Task<SystemSettings> UpdateSettingsAsync(string? companyName, string? companyAddress, int nextInvoiceSequence, int tenantId);
    }
}
