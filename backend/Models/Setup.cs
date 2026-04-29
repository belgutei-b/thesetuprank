namespace backend.Models;

public class Setup
{
    public Guid Id { get; set; }
    public required Guid CreatedBy { get; set; }
    public required string ImageUrl { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public int Rating { get; set; } = 800;
    public bool IsActive { get; set; } = true;
    public DateTime? FeaturedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
