namespace VttTools.TokenManager.Domain;

public sealed record MonsterActions(
    IReadOnlyList<string> List,
    IReadOnlyList<MonsterAttackRoll> AttackRolls
);
