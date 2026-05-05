using System;

namespace backend.Dtos.Ranking;

public class RankingResDto
{
    public required int NumberOfSetups { get; set; }
    public required List<SetupListResDto> Setups { get; set; }
}
