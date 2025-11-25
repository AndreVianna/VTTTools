namespace VttTools.Media.ServiceContracts;

public record AddResourceData
    : Data {
    public string? Description { get; init; }
    public Map<HashSet<string>> Attributes { get; set; } = [];

    public string Path { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public ulong FileLength { get; init; }
    public Size ImageSize { get; init; } = Size.Zero;
    public TimeSpan Duration { get; init; }

    public Stream Stream { get; init; } = null!;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Path))
            result += new Error("Path is required.", nameof(Path));
        if (Stream is null)
            result += new Error("Stream cannot be null.", nameof(Stream));
        else if (!Stream.CanRead)
            result += new Error("Stream must be readable.", nameof(Stream));
        if (string.IsNullOrWhiteSpace(ContentType))
            result += new Error("Content type is required.", nameof(ContentType));
        if (string.IsNullOrWhiteSpace(FileName))
            result += new Error("File name is required.", nameof(FileName));
        if (FileLength == 0)
            result += new Error("File length cannot be zero.", nameof(FileLength));
        if (ImageSize.Width < 0)
            result += new Error("Picture width cannot be negative.", $"{nameof(ImageSize)}.{nameof(Size.Width)}");
        if (ImageSize.Height < 0)
            result += new Error("Picture height cannot be negative.", $"{nameof(ImageSize)}.{nameof(Size.Height)}");
        if (Duration < TimeSpan.Zero)
            result += new Error("Duration cannot be negative.", nameof(Duration));
        return result;
    }
}