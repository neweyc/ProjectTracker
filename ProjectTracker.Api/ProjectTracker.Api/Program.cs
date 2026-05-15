using ProjectTracker.Api;
using ProjectTracker.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            //builder.AllowAnyOrigin();
            builder.AllowAnyMethod();
            builder.AllowAnyHeader();
            builder.WithOrigins("http://localhost:3000", "https://redshifthr.com", "http://localhost:5173", "http://localhost:5174");
            builder.AllowCredentials();
        });
});

builder.Services.AddOpenApi();
Init.RegisterServices(builder.Services, builder.Configuration);

var app = builder.Build();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

Init.ConfigureEndpoints(app);

await Init.InitializeDatabaseAsync(app.Services);

app.Run();
