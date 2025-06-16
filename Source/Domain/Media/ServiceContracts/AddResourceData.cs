namespace VttTools.Media.ServiceContracts;

public record AddResourceData
    : Data {
    public string Path { get; init; } = string.Empty;
    public Stream Stream { get; init; } = null!;
    public ResourceMetadata Metadata { get; init; } = new();
    public string[] Tags { get; set; } = [];

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Path))
            result += new Error("Path is required.", nameof(Path));
        if (Stream is null)
            result += new Error("Stream cannot be null.", nameof(Stream));
        else if (!Stream.CanRead)
            result += new Error("Stream must be readable.", nameof(Stream));
        if (string.IsNullOrWhiteSpace(Metadata.ContentType))
            result += new Error("Content type is required.", $"{nameof(Metadata)}.{nameof(ResourceMetadata.ContentType)}");
        if (string.IsNullOrWhiteSpace(Metadata.FileName))
            result += new Error("File name is required.", $"{nameof(Metadata)}.{nameof(ResourceMetadata.FileName)}");
        if (Metadata.FileLength == 0)
            result += new Error("File length cannot be zero.", $"{nameof(Metadata)}.{nameof(ResourceMetadata.FileLength)}");
        if (Metadata.ImageSize.Width < 0)
            result += new Error("Picture width cannot be negative.", $"{nameof(Metadata)}.{nameof(ResourceMetadata.ImageSize)}.{nameof(Size.Width)}");
        if (Metadata.ImageSize.Height < 0)
            result += new Error("Picture height cannot be negative.", $"{nameof(Metadata)}.{nameof(ResourceMetadata.ImageSize)}.{nameof(Size.Height)}");
        if (Metadata.Duration < TimeSpan.Zero)
            result += new Error("Duration cannot be negative.", $"{nameof(Metadata)}.{nameof(ResourceMetadata.Duration)}");
        return result;
    }
}
