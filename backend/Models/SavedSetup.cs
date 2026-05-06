namespace backend.Models;

public class SavedSetup
{
    public Guid Id { get; set; }
    public required Guid UserId { get; set; }
    public required Guid SetupId { get; set; } // Required foreign key property
    public Setup Setup { get; set; } = null!; // Required reference navigation to principal
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
