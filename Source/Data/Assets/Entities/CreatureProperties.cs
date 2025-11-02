namespace VttTools.Data.Assets.Entities;

public class CreatureProperties {
    public double CellSize { get; set; } = 1;
    public Guid? StatBlockId { get; set; }
    public CreatureCategory Category { get; set; } = CreatureCategory.Character;
    public TokenStyle? TokenStyle { get; set; }
}
