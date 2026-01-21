namespace VttTools.Media.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResourceRole {
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