namespace VttTools.TokenManager.Domain;

public sealed record MonsterAttackRoll(
    string Name,
    string AttackType,
    int Reach,
    int Hit,
    IReadOnlyList<MonsterDamage> Damage
);
