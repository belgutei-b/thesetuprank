namespace backend.Models;

public class Image
{
    public Guid Id { get; set; }
    public required string Key { get; set; }

    public Guid SetupId { get; set; }

    // Navigation property (instead of holding the id, it holds object)
    public Setup Setup { get; set; } = null!;
    public required int pos { get; set; }
}
