namespace VttTools.MediaGenerator.Domain.Images.Models;

public sealed record ImageGenerationResponse(
    byte[] Data,
    bool IsSuccess = true,
    string? ErrorMessage = null,
    int TotalTokens = 0,
    double TotalCost = 0.0,
    TimeSpan? Duration = null);