namespace backend.Models;

public class User
{
    // get & set means that property can be read and written from outside the class
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string Handle { get; set; }
    public required string ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required bool IsActive { get; set; } = true;
    public ICollection<Setup> Setups { get; } = new List<Setup>();
    public ICollection<SavedSetup> SavedSetups { get; } = new List<SavedSetup>();
}
