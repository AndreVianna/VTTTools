namespace VttTools.Jobs.Model;

public sealed record JobItemContext {
    public required Guid JobId { get; init; }
    public required Guid ItemId { get; init; }
    public required int Index { get; init; }
    public string? JobInputJson { get; init; }
    public string? ItemInputJson { get; init; }
    public string? AuthToken { get; init; }
}

public sealed record JobItemResult {
    public bool IsSuccess { get; init; }
    public string? OutputJson { get; init; }
    public string? ErrorMessage { get; init; }

    public static JobItemResult Success(string? outputJson = null)
        => new() { IsSuccess = true, OutputJson = outputJson };

    public static JobItemResult Failure(string errorMessage)
        => new() { IsSuccess = false, ErrorMessage = errorMessage };
}
