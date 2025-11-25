namespace VttTools.Data.Assets.Entities;

public class AssetStatBlockValue {
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public int Level { get; set; }
    [MaxLength(64)]
    public string Key { get; set; } = string.Empty;
    [MaxLength(4096)]
    public string? Value { get; set; }
    public AssetStatBlockValueType Type { get; set; }
}
