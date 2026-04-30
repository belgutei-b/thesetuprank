namespace backend.Dtos;

public class SetupListResDto
{
    public required Guid Id { get; set; }
    public required string ImageUrl { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public int Rating { get; set; }
    public DateTime? FeaturedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public required int Wins { get; set; }
    public required int Losses { get; set; }
}
