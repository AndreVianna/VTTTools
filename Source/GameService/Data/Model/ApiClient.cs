namespace GameService.Data.Model;

[Table("Clients")]
public class ApiClient {
    [Key]
    [MaxLength(200)]
    public required string Id { get; init; }

    [MaxLength(200)]
    public required string HashedSecret { get; init; }
}
