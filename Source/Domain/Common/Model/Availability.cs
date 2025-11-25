namespace VttTools.Common.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Availability {
    Public,
    MineOnly,
    MineAndPublished,
}
