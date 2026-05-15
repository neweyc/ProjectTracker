using ProjectTracker.Api.Features.Projects.CreateProject;
using ProjectTracker.Api.Features.Projects.DeleteProject;
using ProjectTracker.Api.Features.Projects.GetProject;
using ProjectTracker.Api.Features.Projects.GetProjects;
using ProjectTracker.Api.Features.Projects.UpdateProject;

namespace ProjectTracker.Api.Features.Projects;

public static class ProjectEndpoints
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        CreateProjectEndpoint.Map(app);
        GetProjectsEndpoint.Map(app);
        GetProjectEndpoint.Map(app);
        UpdateProjectEndpoint.Map(app);
        DeleteProjectEndpoint.Map(app);
        return app;
    }
}
