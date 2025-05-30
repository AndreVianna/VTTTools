namespace VttTools.Media.Model;

public record ResourceFileInfo() {
    public ResourceFileInfo(ResourceType type, string name, int width, int height)
        : this() {
        Type = type;
        Name = name;
        Width = width;
        Height = height;
    }

    public ResourceType Type { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Width { get; init; }
    public int Height { get; init; }
}