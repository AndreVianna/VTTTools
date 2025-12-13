namespace VttTools.Jobs.Services;

public sealed record JobItemResult {
    public bool IsSuccess { get; init; }
    public string? OutputJson { get; init; }
    public string? ErrorMessage { get; init; }

    public static JobItemResult Success(string? outputJson = null)
        => new() { IsSuccess = true, OutputJson = outputJson };

    public static JobItemResult Failure(string errorMessage)
        => new() { IsSuccess = false, ErrorMessage = errorMessage };
}