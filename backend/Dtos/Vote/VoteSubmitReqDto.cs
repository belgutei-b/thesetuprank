namespace backend.Dtos;

public class VoteSubmitReqDto
{
    public required Guid BattleId { get; set; }
    public required Guid WinnerId { get; set; }
    public required Guid LoserId { get; set; }
}
