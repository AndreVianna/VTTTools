using System.ComponentModel.DataAnnotations;

namespace VttTools.AssetImageManager.Domain.Images.Models;

public sealed record ImageGenerationResponse(
    [Required] byte[] Data,
    bool IsSuccess = true,
    string? ErrorMessage = null,
    int TotalTokens = 0,
    double TotalCost = 0.0,
    TimeSpan? Duration = null);
