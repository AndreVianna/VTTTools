namespace VttTools.TokenManager.Domain;

// Domain/Entities/MonsterDefinition.cs
public sealed record MonsterDefinition(
    string Name,
    int Ac,
    string Size,
    string CreatureType,
    string Alignment,
    IReadOnlyList<string>? Languages,
    int MaxHitPoints,
    string HitDice,
    MonsterSpeed Speed,
    MonsterStats Modifiers,
    MonsterStats Stats,
    MonsterSavingThrows SavingThrows,
    MonsterSkills Skills,
    IReadOnlyList<string> Traits,
    MonsterActions Actions,
    IReadOnlyList<string> LegendaryActions,
    IReadOnlyList<string> Reactions,
    MonsterChallenge Challenge,
    string? ImageUrl
);
