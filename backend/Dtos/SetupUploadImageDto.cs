using System;

namespace backend.Dtos;

public class SetupUploadImageDto
{
    public required string UploadUrl { get; set; }
    public required string ImageUrl { get; set; }
}
