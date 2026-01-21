namespace VttTools.Data.Assets.Entities;

public class AssetStatEntry {
    public Guid AssetId { get; set; }
    public Asset Asset { get; set; } = null!;
    public Guid GameSystemId { get; set; }
    public Data.Common.Entities.GameSystem GameSystem { get; set; } = null!;
    public int Level { get; set; }
    [MaxLength(64)]
    public string Key { get; set; } = string.Empty;
    [MaxLength(8192)]
    public string? Value { get; set; }
    public AssetStatEntryType Type { get; set; }
    [MaxLength(2048)]
    public string? Description { get; set; }
    [MaxLength(1024)]
    public string? Modifiers { get; set; }

    [JsonIgnore]
    public decimal AsNumber => Type == AssetStatEntryType.Number ? Convert.ToDecimal(Value)
                                       : throw new InvalidCastException("The value is not a number.");
    [JsonIgnore]
    public string AsText => Type == AssetStatEntryType.Text ? Convert.ToString(Value)!
                                     : throw new InvalidCastException("The value is not text.");
    [JsonIgnore]
    public bool AsFlag => Type == AssetStatEntryType.Flag ? Convert.ToBoolean(Value)
                                     : throw new InvalidCastException("The value is not a flag.");
}