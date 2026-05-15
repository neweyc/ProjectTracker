using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class SettingsService(ProjectTrackerDbContext context) : ISettingsService
    {
        public async Task<SystemSettings> GetSettingsAsync(int tenantId)
        {
            var settings = await context.SystemSettings.FirstOrDefaultAsync(s => s.TenantId == tenantId);
            if (settings == null)
            {
                settings = new SystemSettings { TenantId = tenantId, NextInvoiceSequence = 1 };
                context.SystemSettings.Add(settings);
                await context.SaveChangesAsync();
            }
            return settings;
        }

        public async Task<SystemSettings> UpdateSettingsAsync(string? companyName, string? companyAddress, int nextInvoiceSequence, int tenantId)
        {
            var settings = await context.SystemSettings.FirstOrDefaultAsync(s => s.TenantId == tenantId);
            if (settings == null)
            {
                settings = new SystemSettings { TenantId = tenantId };
                context.SystemSettings.Add(settings);
            }

            settings.CompanyName = companyName;
            settings.CompanyAddress = companyAddress;
            settings.NextInvoiceSequence = nextInvoiceSequence;

            await context.SaveChangesAsync();
            return settings;
        }
    }
}
