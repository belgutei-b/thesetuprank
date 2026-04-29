using System;

namespace backend.Dtos;

public class SetupBriefDto
{

    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string ImageUrl { get; set; }
    public required int Rating { get; set; }
}
