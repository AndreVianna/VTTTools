namespace VttTools.TokenManager.Application.Commands;

public sealed record ListTokensCommandOptions(EntityType? TypeFilter, string? IdOrName);
