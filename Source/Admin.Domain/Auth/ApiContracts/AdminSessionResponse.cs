namespace VttTools.Admin.Auth.ApiContracts;

public record AdminSessionResponse : Response {
    public bool IsValid { get; init; }
    public DateTime? ExpiresAt { get; init; }
}