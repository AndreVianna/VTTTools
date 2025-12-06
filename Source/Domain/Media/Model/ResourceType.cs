namespace VttTools.Media.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResourceType {
    Undefined,
    Background,
    Token,
    Portrait,
    Overlay,
    Illustration,
    SoundEffect,
    AmbientSound,
    CutScene,
    UserAvatar,
}