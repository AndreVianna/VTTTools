namespace VttTools.MediaGenerator.Domain.Images.Contracts;

public interface IImageGenerator {
    Task<GenerateImageResponse> GenerateImageFileAsync(
        string model,
        string imageType,
        string prompt,
        CancellationToken ct = default);
}