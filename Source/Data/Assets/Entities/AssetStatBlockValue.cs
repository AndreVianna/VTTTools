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

    [JsonIgnore]
    public decimal AsNumber => Type == AssetStatBlockValueType.Number ? Convert.ToDecimal(Value)
                                       : throw new InvalidCastException("The value is not a number.");
    [JsonIgnore]
    public string AsText => Type == AssetStatBlockValueType.Text ? Convert.ToString(Value)!
                                     : throw new InvalidCastException("The value is not text.");
    [JsonIgnore]
    public bool AsFlag => Type == AssetStatBlockValueType.Flag ? Convert.ToBoolean(Value)
                                     : throw new InvalidCastException("The value is not a flag.");
}
