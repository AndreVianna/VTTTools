namespace VttTools.Auth.ApiContracts;

public record PasswordChangeResponse : Response {
    public bool Success { get; init; }
    public string? Message { get; init; }
}
