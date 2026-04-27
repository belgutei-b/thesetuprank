using System;

namespace backend.Dtos;

public class SetupPostDto
{
    public required String ImageUrl { get; set; }
    public required String Description { get; set; }
}
