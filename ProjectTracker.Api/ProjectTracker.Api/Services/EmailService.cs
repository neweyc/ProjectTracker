using Newtonsoft.Json.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace ProjectTracker.Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private readonly string _fromAddress;
        private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(15) };
        private const string ApiUrl = "https://api.zeptomail.com/v1.1/email";


        public EmailService(HttpClient http, IConfiguration configuration)
        {
            _http = http;
            _apiKey = configuration["Email_Password"] ?? string.Empty;
            _fromAddress = configuration["Email_FromAddress"] ?? "noreply@oliveinvoice.com";
        }


        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            if (string.IsNullOrEmpty(_apiKey))
                throw new InvalidOperationException("ZeptoMail API key (Email_Password) is not configured.");

            var payload = new
            {
                from = new { address = _fromAddress },
                to = new[] { new { email_address = new { address = toEmail } } },
                subject,
                htmlbody = htmlBody
            };




            using var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl);
            //request.Headers.TryAddWithoutValidation("Authorization", $"{_apiKey}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Zoho-enczapikey", _apiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");
            using var response = await Http.SendAsync(request);
            response.EnsureSuccessStatusCode();

        }
    }
}
