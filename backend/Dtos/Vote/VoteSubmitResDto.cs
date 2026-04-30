namespace backend.Dtos.Vote;

public class VoteSubmitResDto
{
    public required Guid BattleId { get; set; }
    public required int WinnerDiff { get; set; }
    public required int LoserDiff { get; set; }
}
