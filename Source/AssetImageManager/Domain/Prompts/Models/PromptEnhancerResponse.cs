using System.ComponentModel.DataAnnotations;

namespace VttTools.AssetImageManager.Domain.Prompts.Models;

public sealed record PromptEnhancerResponse(
    [Required] string Prompt,
    bool IsSuccess = true,
    string? ErrorMessage = null,
    int TotalTokens = 0,
    double TotalCost = 0.0,
    TimeSpan? Duration = null);
