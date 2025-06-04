namespace VttTools.Media.Model;

public record ResourceInfo() {
    public ResourceInfo(string id, ResourceType type, ulong bytes, Size size, TimeSpan duration)
        : this() {
        Id = id;
        Type = type;
        Bytes = bytes;
        Size = size;
        Duration = duration;
    }

    public ResourceType Type { get; init; }
    public string Id { get; init; } = string.Empty;
    public ulong Bytes { get; init; }
    public Size Size { get; init; }
    public TimeSpan Duration { get; init; }
}