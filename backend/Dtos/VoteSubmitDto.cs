namespace backend.Dtos;

public class VoteSubmitDto
{
    public required Guid BattleId { get; set; }
    public required Guid WinnerId { get; set; }
    public required Guid LoserId { get; set; }
}
