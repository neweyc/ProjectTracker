namespace ProjectTracker.Api.Features.Projects.CreateProject;

public record CreateProjectRequest(string Name, string? Description);
public record CreateProjectResponse(int Id, string Name, string? Description, DateTime CreatedAt);
