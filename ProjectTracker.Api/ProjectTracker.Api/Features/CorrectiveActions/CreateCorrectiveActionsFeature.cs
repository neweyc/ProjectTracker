using ProjectTracker.Api.Routing;
using System.Text.Json;

namespace ProjectTracker.Api.Features.CorrectiveActions
{
    //This is an example of how to create and architect a featre.  Use this pattern as a template for future features.  The feature is broken down into three main components:
    //1. Command: This class represents the data that is required to execute the feature.  It should contain all the properties that are needed to perform the action.
    //2. CommandHandler: This class contains the logic to handle the command.  It should take the command as input, perform any necessary validation or transformation, and then call the appropriate service methods to execute the action.
    //3. Endpoint: This class is responsible for mapping the HTTP endpoint to the command handler.  It should define the route, and HTTP method.



    //public class CreateCorrectiveActionFeature
    //{
    //    public class Command
    //    {
    //        public Guid PersonnelId { get; set; }
    //        public string ActionType { get; set; } = string.Empty;
    //        public string Description { get; set; } = string.Empty;
    //        public DateTime IncidentDate { get; set; }
    //        public DateTime DateReported { get; set; }
    //        public string Status { get; set; } = "pending";
    //        public string? Notes { get; set; }
    //        public string? ReportedBy { get; set; }
    //        public JsonElement? Attachments { get; set; }
    //        public string? Location { get; set; }
    //        public string? Witnesses { get; set; }
    //        public bool FollowUpRequired { get; set; }
    //        public bool EmployeeAcknowledged { get; set; }
    //        public string? FollowUpNotes { get; set; }
    //        public DateTime? FollowUpDate { get; set; }
    //        public DateTime? AcknowledgmentDate { get; set; }
    //        public string? Category { get; set; }

    //    }

    //    public class CommandHandler(ICorrectiveActionService correctiveActionService)
    //    {
    //        private static string NormalizeActionType(string actionType)
    //        {
    //            return actionType.ToLower() switch
    //            {
    //                "verbal" => "verbal_warning",
    //                _ => actionType
    //            };
    //        }

    //        public async Task<CommandResult> Handle(Command command)
    //        {
    //            var dto = new CorrectiveActionDto
    //            {
    //                Id = Guid.NewGuid(),
    //                PersonnelId = command.PersonnelId,
    //                ActionType = NormalizeActionType(command.ActionType),
    //                Description = command.Description,
    //                IncidentDate = command.IncidentDate.Kind == DateTimeKind.Unspecified ?
    //                    DateTime.SpecifyKind(command.IncidentDate, DateTimeKind.Utc) :
    //                    command.IncidentDate.ToUniversalTime(),
    //                ActionDate = command.DateReported.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(command.DateReported, DateTimeKind.Utc) : command.DateReported.ToUniversalTime(),
    //                Status = command.Status.ToLower() == "pending" ? "active" : command.Status,
    //                Notes = command.Notes,
    //                Attachments = command.Attachments.HasValue ? JsonSerializer.Serialize(command.Attachments.Value) : null,
    //                CreatedAt = DateTime.UtcNow,
    //                UpdatedAt = DateTime.UtcNow,
    //                Location = command.Location,
    //                Witnesses = command.Witnesses,
    //                FollowUpRequired = command.FollowUpRequired,
    //                EmployeeAcknowledged = command.EmployeeAcknowledged,
    //                FollowUpDate = command.FollowUpDate,
    //                FollowUpNotes = command.FollowUpNotes,
    //                AcknowledgmentDate = command.AcknowledgmentDate,
    //                ReportedBy = command.ReportedBy,
    //                Category = command.Category,
    //            };

    //            if (dto.FollowUpDate.HasValue)
    //            {
    //                dto.FollowUpDate = dto.FollowUpDate.Value.Kind == DateTimeKind.Unspecified ?
    //                    DateTime.SpecifyKind(dto.FollowUpDate.Value, DateTimeKind.Utc) :
    //                    dto.FollowUpDate.Value.ToUniversalTime();
    //            }

    //            if (dto.AcknowledgmentDate.HasValue)
    //            {
    //                dto.AcknowledgmentDate = dto.AcknowledgmentDate.Value.Kind == DateTimeKind.Unspecified ?
    //                    DateTime.SpecifyKind(dto.AcknowledgmentDate.Value, DateTimeKind.Utc) :
    //                    dto.AcknowledgmentDate.Value.ToUniversalTime();
    //            }

    //            var created = await correctiveActionService.CreateAsync(dto);
    //            return CommandResult.Success("Corrective action created", created);
    //        }
    //    }

    //    public class Endpoint : IEndpoint
    //    {
    //        public void MapEndpoint(IEndpointRouteBuilder app)
    //        {
    //            app.MapPost("/api/corrective-actions", async Task<IResult> (
    //                Command command,
    //                [FromServices] ICorrectiveActionService correctiveActionService) =>
    //            {
    //                var handler = new CommandHandler(correctiveActionService);
    //                var result = await handler.Handle(command);
    //                if (!result.IsSuccess)
    //                {
    //                    return Results.BadRequest(result);
    //                }
    //                return Results.Ok(result.Data);
    //            })
    //            .RequireAuthorization()
    //            .WithTags("CorrectiveActions");
    //        }
    //    }
    //}

}
