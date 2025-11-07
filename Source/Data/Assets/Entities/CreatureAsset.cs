namespace VttTools.Data.Assets.Entities;

public class CreatureAsset : Asset {
    public Guid? StatBlockId { get; set; }
    public CreatureCategory Category { get; set; } = CreatureCategory.Character;
    public TokenStyle? TokenStyle { get; set; }
}
