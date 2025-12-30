namespace VttTools.AI.Model;

public enum GeneratedContentType {
    ImagePortrait = 1,
    ImageToken = 2,
    ImageBackground = 3,
    AudioSoundEffect = 4,
    AudioAmbientSound = 5,
    AudioMusic = 6,
    AudioVoice = 7,
    VideoBackground = 8,
    VideoOverlay = 9,
    TextDescription = 10,
    TextStatBlock = 11,
    TextDialogue = 12,
    PromptEnhancement = 13,
}

public static class GeneratedContentTypeExtensions {
    public static (string Type, string Subtype) GetTypeAndSubtype(this GeneratedContentType contentType)
        => contentType switch {
            GeneratedContentType.ImagePortrait => ("DefaultDisplay", "Portrait"),
            GeneratedContentType.ImageToken => ("DefaultDisplay", "Token"),
            GeneratedContentType.ImageBackground => ("DefaultDisplay", "Background"),
            GeneratedContentType.AudioSoundEffect => ("Audio", "SoundEffect"),
            GeneratedContentType.AudioAmbientSound => ("Audio", "AmbientSound"),
            GeneratedContentType.AudioMusic => ("Audio", "Music"),
            GeneratedContentType.AudioVoice => ("Audio", "Voice"),
            GeneratedContentType.VideoBackground => ("Video", "Background"),
            GeneratedContentType.VideoOverlay => ("Video", "Overlay"),
            GeneratedContentType.TextDescription => ("Text", "Description"),
            GeneratedContentType.TextStatBlock => ("Text", "StatBlock"),
            GeneratedContentType.TextDialogue => ("Text", "Dialogue"),
            GeneratedContentType.PromptEnhancement => ("Prompt", "Enhancement"),
            _ => throw new ArgumentOutOfRangeException(nameof(contentType), contentType, "Unknown content type")
        };

    public static string GetType(this GeneratedContentType contentType)
        => contentType.GetTypeAndSubtype().Type;

    public static string GetSubtype(this GeneratedContentType contentType)
        => contentType.GetTypeAndSubtype().Subtype;
}
