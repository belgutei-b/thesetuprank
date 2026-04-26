using System;

namespace backend.Models;

public class Post
{
    public Guid Id { get; set; }
    public required Guid CreatedBy { get; set; }
    public required string ImageId { get; set; }
    public required int Rating { get; set; } = 800;
    public required string Description { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastFeaturedAt { get; set; }
}
