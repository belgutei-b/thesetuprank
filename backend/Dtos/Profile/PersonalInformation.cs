namespace backend.Dtos.Profile;

public class PersonalInformation
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Handle { get; set; }
    public DateTime CreatedAt { get; set; }
}
