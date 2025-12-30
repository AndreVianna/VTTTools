namespace VttTools.Assets.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AssetKind {
    Undefined = 0,
    Character = 1,
    Creature = 2,
    Object = 3,
    Effect = 4,
}