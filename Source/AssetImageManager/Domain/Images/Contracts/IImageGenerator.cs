namespace VttTools.AssetImageManager.Domain.Images.Contracts;

public interface IImageGenerator {
    Task<ImageGenerationResponse> GenerateImageAsync(
        string model,
        string imageType,
        string prompt,
        CancellationToken ct = default);
}
