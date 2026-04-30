namespace backend.Models;

public class Battle
{
    public Guid Id { get; set; }
    public Guid Setup1Id { get; set; }
    public Setup Setup1 { get; set; } = null!;
    public Guid Setup2Id { get; set; }
    public Setup Setup2 { get; set; } = null!;
    public Guid? WinnerId { get; set; }
    public Guid? LoserId { get; set; }
    public Guid? VoterId { get; set; }         // nullable — anonymous users
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; } // null = skipped or abandoned
}
