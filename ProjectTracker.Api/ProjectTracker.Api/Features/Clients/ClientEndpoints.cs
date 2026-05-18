using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Clients
{
    public class ClientEndpoints : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/clients")
                .WithTags("Clients")
                .RequireAuthorization();

            group.MapGet("/", async (IClientService clientService, ICurrentUser currentUser) =>
            {
                var clients = await clientService.GetAllAsync(currentUser.TenantId);
                return Results.Ok(clients.Select(c => new ClientResponse(c.Id, c.Name, c.Email, c.Address, c.CreatedAt)));
            });

            group.MapGet("/{id:int}", async (int id, IClientService clientService, ICurrentUser currentUser) =>
            {
                var client = await clientService.GetByIdAsync(id, currentUser.TenantId);
                return client is not null 
                    ? Results.Ok(new ClientResponse(client.Id, client.Name, client.Email, client.Address, client.CreatedAt))
                    : Results.NotFound();
            });

            group.MapPost("/", async (CreateClientRequest request, IClientService clientService, IBillingService billingService, ICurrentUser currentUser) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return Results.BadRequest("Name is required.");

                var tier = await billingService.GetSubscriptionTierAsync(currentUser.TenantId);
                var max = SubscriptionLimits.MaxClients(tier);
                if (max.HasValue && await clientService.CountAsync(currentUser.TenantId) >= max.Value)
                    return Results.Json(new { error = "limit_reached", message = SubscriptionLimits.UpgradeMessage("clients", max.Value) }, statusCode: 402);

                var client = await clientService.CreateAsync(request.Name, request.Email, request.Address, currentUser.TenantId);
                return Results.Created($"/api/clients/{client.Id}", new ClientResponse(client.Id, client.Name, client.Email, client.Address, client.CreatedAt));
            });

            group.MapPut("/{id:int}", async (int id, UpdateClientRequest request, IClientService clientService, ICurrentUser currentUser) =>
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return Results.BadRequest("Name is required.");

                var client = await clientService.UpdateAsync(id, request.Name, request.Email, request.Address, currentUser.TenantId);
                return client is not null
                    ? Results.Ok(new ClientResponse(client.Id, client.Name, client.Email, client.Address, client.CreatedAt))
                    : Results.NotFound();
            });

            group.MapDelete("/{id:int}", async (int id, IClientService clientService, ICurrentUser currentUser) =>
            {
                return await clientService.DeleteAsync(id, currentUser.TenantId)
                    ? Results.NoContent()
                    : Results.NotFound();
            });
        }
    }

    public record ClientResponse(int Id, string Name, string? Email, string? Address, DateTime CreatedAt);
    public record CreateClientRequest(string Name, string? Email, string? Address);
    public record UpdateClientRequest(string Name, string? Email, string? Address);
}
