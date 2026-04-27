namespace backend.Dtos;

public class SetupDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = "";
    public string Description { get; set; } = "";
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}
