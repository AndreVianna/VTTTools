namespace VttTools.AssetImageManager.Infrastructure.Storage;

public sealed record TokenMetadata(
    string EntityId,
    string EntityName,
    string EntityType,
    string EntitySlug,
    string Prompt,
    DateTime CreatedAtUtc,
    string FileName);
