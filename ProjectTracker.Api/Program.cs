using ProjectTracker.Api;
using ProjectTracker.Api.Data;
using ProjectTracker.Api.Features.Projects;
using ProjectTracker.Api.Features.Tasks;
using ProjectTracker.Api.Features.TimeEntries;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

Init.RegisterServices(builder.Services, builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapProjectEndpoints();
app.MapTaskEndpoints();
app.MapTimeEntryEndpoints();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ProjectTrackerDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
