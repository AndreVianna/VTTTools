namespace VttTools.Assets.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AssetKind {
    Undefined,
    Character,
    Creature,
    Effect,
    Object
}