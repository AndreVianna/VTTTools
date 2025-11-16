namespace VttTools.TokenManager.Application.Commands;

public sealed record GenerateTokensCommandOptions(
    string InputPath,
    int? Limit,
    int DelayMs,
    int Variants,
    string? IdOrNameFilter);