namespace VttTools.AssetImageManager.Domain.Legacy;

public sealed record MonsterActions(
    IReadOnlyList<string> List,
    IReadOnlyList<MonsterAttackRoll> AttackRolls
);
