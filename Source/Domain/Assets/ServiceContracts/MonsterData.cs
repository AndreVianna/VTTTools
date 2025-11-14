namespace VttTools.Assets.ServiceContracts;

public record MonsterData {
    public Guid? StatBlockId { get; init; }
    public TokenStyle? TokenStyle { get; init; }
}
