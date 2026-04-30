using System;

namespace backend.Dtos.Vote;

public class VoteGetResDto
{
    public required Guid BattleId { get; set; }
    public required SetupBriefDto SetupA { get; set; }
    public required SetupBriefDto SetupB { get; set; }
}
