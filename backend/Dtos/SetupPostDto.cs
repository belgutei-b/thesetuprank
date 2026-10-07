namespace backend.Dtos;

// TODO: currently it takes only one image
// it should support up to 4 images
public class SetupPostDto
{
    public required String Name { get; set; }
    public required IFormFile SetupImage { get; set; }
    public required String Description { get; set; }
}
