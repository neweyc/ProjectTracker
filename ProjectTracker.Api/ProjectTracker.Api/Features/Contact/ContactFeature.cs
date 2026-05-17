using static System.Net.WebUtility;
using ProjectTracker.Api.Routing;
using ProjectTracker.Api.Services;

namespace ProjectTracker.Api.Features.Contact
{
    public record ContactRequest(
        string Name,
        string Email,
        string Category,
        string Message
    );

    public class ContactFeature : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/contact", HandleAsync)
               .AllowAnonymous()
               .WithName("Contact");
        }

        private static async Task<IResult> HandleAsync(
            ContactRequest request,
            IEmailService emailService)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 100)
                return Results.BadRequest("Invalid name.");
            if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 200 || !request.Email.Contains('@'))
                return Results.BadRequest("Invalid email.");
            if (string.IsNullOrWhiteSpace(request.Message) || request.Message.Length < 10 || request.Message.Length > 5000)
                return Results.BadRequest("Message must be between 10 and 5000 characters.");

            var validCategories = new[] { "Feature Request", "Bug Report", "Question", "Other" };
            if (!validCategories.Contains(request.Category))
                return Results.BadRequest("Invalid category.");

            var safeMessage = HtmlEncode(request.Message).Replace("\n", "<br />");
            var html = $"""
                <!DOCTYPE html>
                <html>
                <body style="font-family: sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <div style="border-left: 4px solid #7c3aed; padding-left: 16px; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 4px; color: #7c3aed;">Olive Invoice — {HtmlEncode(request.Category)}</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">New message via the contact form</p>
                  </div>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 80px;">From</td>
                      <td style="padding: 8px 0; font-size: 14px;">{HtmlEncode(request.Name)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Reply to</td>
                      <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:{HtmlEncode(request.Email)}" style="color: #7c3aed;">{HtmlEncode(request.Email)}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Category</td>
                      <td style="padding: 8px 0; font-size: 14px;">{HtmlEncode(request.Category)}</td>
                    </tr>
                  </table>
                  <div style="background: #f9fafb; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.6;">{safeMessage}</p>
                  </div>
                </body>
                </html>
                """;

            await emailService.SendAsync(
                "admin@craytech-solutions.com",
                $"[Olive Invoice] {request.Category} from {request.Name}",
                html
            );

            return Results.Ok();
        }

    }
}
