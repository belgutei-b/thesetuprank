using System;

namespace backend.Dtos;

public class BattleDto
{
    public Guid BattleId { get; set; }
    public SetupDto[] Setups { get; set; } = [];
}
