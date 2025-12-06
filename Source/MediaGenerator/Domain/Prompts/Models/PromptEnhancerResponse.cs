namespace VttTools.MediaGenerator.Domain.Prompts.Models;

public sealed record PromptEnhancerResponse(
    string Prompt,
    bool IsSuccess = true,
    string? ErrorMessage = null,
    int TotalTokens = 0,
    double TotalCost = 0.0,
    TimeSpan? Duration = null);