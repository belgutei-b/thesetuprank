using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    // get & set means that property can be read and written from outside the class
    public Guid Id { get; set; }
    
    // Fields from Google
    [MaxLength(255)]
    public required string GoogleSubjectId { get; set; }
    [MaxLength(255)]
    public required string Email { get; set; }
    [MaxLength(100)]
    public string? Name { get; set; }
    [MaxLength(2048)]
    public string? ImageUrl { get; set; }
    
    [MaxLength(100)]
    public required string Handle { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public ICollection<Setup> Setups { get; } = new List<Setup>();
    public ICollection<SavedSetup> SavedSetups { get; } = new List<SavedSetup>();
}
