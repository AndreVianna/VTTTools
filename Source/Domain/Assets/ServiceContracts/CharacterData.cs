namespace VttTools.Assets.ServiceContracts;

public record CharacterData {
    public Guid? StatBlockId { get; init; }
    public TokenStyle? TokenStyle { get; init; }
}
