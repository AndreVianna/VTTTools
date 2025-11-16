namespace VttTools.TokenManager.Domain;

public sealed class TokenGenerationService(IStabilityClient stability, IFileTokenStore store, int outputImageSize = 0, string aspectRatio = "1:1")
    : ITokenGenerationService {
    private readonly IStabilityClient _stability = stability;
    private readonly IFileTokenStore _store = store;
    private readonly int _outputImageSize = outputImageSize;
    private readonly string _aspectRatio = aspectRatio;

    public async Task GenerateAsync(TokenEntity entity, int variantIndex, CancellationToken ct = default) {
        var prompt = BuildPrompt(entity);
        var negativePrompt = "border, frame, text, UI elements, watermark, letters, numbers";

        var bytes = await _stability.GeneratePngAsync(prompt, negativePrompt, _aspectRatio, ct);

        if (_outputImageSize > 0)
            bytes = ImageProcessor.ResizeIfNeeded(bytes, _outputImageSize);

        var metadata = new TokenMetadata(
            EntityId: entity.Id,
            EntityName: entity.Name,
            EntityType: entity.Type.ToString(),
            EntitySlug: entity.Id,
            Prompt: prompt,
            CreatedAtUtc: DateTime.UtcNow,
            FileName: $"token_{variantIndex}.png"
        );

        await _store.SaveVariantAsync(metadata, bytes, variantIndex, ct);
    }

    private static string BuildPrompt(TokenEntity e) {
        // This branch is for monsters; later you can split by type
        if (e.Type == EntityType.Monster)
            return BuildMonsterPrompt(e);

        // Fallback for other types when you add them
        var sb = new StringBuilder();
        sb.Append($"A detailed top-down token of {e.Name}, fantasy art, ");
        sb.Append("centered, full body, transparent background, no border, sharp focus, high contrast");
        return sb.ToString();
    }

    private static string BuildMonsterPrompt(TokenEntity e) {
        var sizeDescriptor = e.Size?.ToLowerInvariant() switch {
            "tiny" => "tiny",
            "small" => "small",
            "medium" => "human-sized",
            "large" => "large",
            "huge" => "huge",
            "gargantuan" => "gigantic",
            _ => e.Size?.ToLowerInvariant() ?? "large"
        };

        var typeDescriptor = string.IsNullOrWhiteSpace(e.Subtype)
            ? e.Type.ToString().ToLowerInvariant()
            : e.Subtype!.ToLowerInvariant();

        var envText = e.EnvironmentsOrEmpty.Any()
            ? $" in a {string.Join(" or ", e.EnvironmentsOrEmpty)} environment"
            : string.Empty;

        var sb = new StringBuilder();
        sb.Append($"A detailed top-down token of a {sizeDescriptor} {typeDescriptor} called {e.Name}{envText}, ");
        sb.Append("dark fantasy art, centered, full body, sharp focus, ");
        sb.Append("transparent background, no border, high contrast, game-ready icon, ");
        sb.Append("no UI, no frame, no text");

        return sb.ToString();
    }
}
