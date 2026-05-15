namespace ProjectTracker.Api.Data.Entities;

public class TimeEntry
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public decimal Hours { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ProjectTask Task { get; set; } = null!;
}
