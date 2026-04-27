using System;

namespace backend.Models;

public class Vote
{
    public Guid Id { get; set; }
    public Guid BattleId { get; set; }
    public Battle Battle { get; set; } = null!;
    public Guid WinnerId { get; set; }
    public Setup Winner { get; set; } = null!;
    public Guid LoserId { get; set; }
    public Setup Loser { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
