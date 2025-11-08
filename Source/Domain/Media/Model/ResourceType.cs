namespace VttTools.Media.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResourceType {
    Undefined,
    Image,
    Animation,
    Video,
    Audio,
}