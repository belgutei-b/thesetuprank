using System;

namespace backend.Dtos;

public class VoteGetDto
{
    public required Guid BattleId { get; set; }
    public required SetupBriefDto SetupA { get; set; }
    public required SetupBriefDto SetupB { get; set; }
}
