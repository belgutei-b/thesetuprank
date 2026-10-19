namespace backend.Dtos;

public class SetupPostDto
{
    public required String Name { get; set; }
    public required IReadOnlyList<IFormFile> SetupImages { get; set; }
    public required String Description { get; set; }
}
