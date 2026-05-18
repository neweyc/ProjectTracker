using Microsoft.EntityFrameworkCore;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Data.Entities;

namespace ProjectTracker.Api.Services
{
    public class InvoiceService(ProjectTrackerDbContext context, ISettingsService settingsService) : IInvoiceService
    {
        public Task<int> CountAllAsync(int tenantId)
            => context.Invoices.CountAsync(i => i.Project.TenantId == tenantId);

        public async Task<IEnumerable<Invoice>> GetByProjectAsync(int projectId, int tenantId)
            => await context.Invoices
                .Include(i => i.LineItems)
                .Where(i => i.ProjectId == projectId && i.Project.TenantId == tenantId)
                .OrderByDescending(i => i.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

        public async Task<Invoice?> GetByIdAsync(int projectId, int invoiceId, int tenantId)
            => await context.Invoices
                .Include(i => i.LineItems)
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.ProjectId == projectId && i.Project.TenantId == tenantId);

        public async Task<Invoice?> CreateInvoiceAsync(int projectId, CreateInvoiceDto dto, int tenantId)
        {
            if (!await context.Projects.AnyAsync(p => p.Id == projectId && p.TenantId == tenantId))
                return null;

            var taskIds = dto.LineItems.Select(li => li.TaskId).ToList();
            var tasks = await context.Tasks
                .Include(t => t.TimeEntries)
                .Where(t => t.ProjectId == projectId && taskIds.Contains(t.Id))
                .ToListAsync();

            if (tasks.Count != taskIds.Count)
                return null;

            var settings = await settingsService.GetSettingsAsync(tenantId);

            var invoiceNumber = $"{DateTime.UtcNow.Year}-{settings.NextInvoiceSequence:D2}";

            var invoice = new Invoice
            {
                ProjectId = projectId,
                InvoiceNumber = invoiceNumber,
                CompanyName = settings.CompanyName,
                ClientName = dto.ClientName,
                ClientAddress = dto.ClientAddress,
                DueDate = dto.DueDate,
                TaxRate = dto.TaxRate,
                Notes = dto.Notes,
                Status = InvoiceStatus.Draft,
                CreatedAt = DateTime.UtcNow,
            };

            foreach (var li in dto.LineItems)
            {
                var task = tasks.First(t => t.Id == li.TaskId);
                var hours = task.TimeEntries.Sum(e => e.Hours);
                invoice.LineItems.Add(new InvoiceLineItem
                {
                    TaskId = task.Id,
                    Description = task.Title,
                    Hours = hours,
                    HourlyRate = li.HourlyRate,
                });
                task.IsInvoiced = true;
            }

            settings.NextInvoiceSequence++;
            context.Invoices.Add(invoice);
            await context.SaveChangesAsync();
            return invoice;
        }

        public async Task<Invoice?> UpdateInvoiceAsync(int projectId, int invoiceId, UpdateInvoiceDto dto, int tenantId)
        {
            var invoice = await context.Invoices
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.ProjectId == projectId && i.Project.TenantId == tenantId);
            if (invoice is null) return null;

            invoice.ClientName = dto.ClientName;
            invoice.ClientAddress = dto.ClientAddress;
            invoice.DueDate = dto.DueDate;
            invoice.TaxRate = dto.TaxRate;
            invoice.Notes = dto.Notes;
            invoice.Status = dto.Status;

            await context.SaveChangesAsync();
            return invoice;
        }

        public async Task<bool> DeleteInvoiceAsync(int projectId, int invoiceId, int tenantId)
        {
            var invoice = await context.Invoices
                .Include(i => i.LineItems)
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.ProjectId == projectId && i.Project.TenantId == tenantId);
            if (invoice is null) return false;

            var taskIds = invoice.LineItems.Select(li => li.TaskId).ToList();
            var tasks = await context.Tasks.Where(t => taskIds.Contains(t.Id)).ToListAsync();
            foreach (var task in tasks)
                task.IsInvoiced = false;

            context.Invoices.Remove(invoice);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
