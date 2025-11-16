namespace VttTools.TokenManager.Infrastructure.Storage;

public sealed record TokenMetadata(
    string EntityId,
    string EntityName,
    string EntityType,
    string EntitySlug,
    string Prompt,
    string EngineId,
    DateTime CreatedAtUtc,
    string FileName);
