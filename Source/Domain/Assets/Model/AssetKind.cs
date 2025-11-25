namespace VttTools.Assets.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AssetKind {
    Character,
    Creature,
    Object
}
