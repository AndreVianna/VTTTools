namespace VttTools.MediaGenerator.Domain.Images.Contracts;

public interface IImageGenerator {
    Task<ImageGenerationResponse> GenerateImageFileAsync(
        string model,
        string imageType,
        string prompt,
        CancellationToken ct = default);
}