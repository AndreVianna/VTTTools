namespace VttTools.Assets.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AssetSortBy {
    Name,
    Kind,
    Category,
    Type,
}
