namespace VttTools.Media.ServiceContracts;

public record UploadResourceData
    : Data {
    public string ContentType { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public Stream? Stream { get; init; }

    private const long _maxFileSizeBytes = 100 * 1024 * 1024; // 100 MB

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(ContentType))
            result += new Error("The content type is required.", nameof(ContentType));
        else if (ContentType.Length > 127)
            result += new Error("ContentType cannot exceed 127 characters.", nameof(ContentType));
        else if (!ContentType.Contains('/'))
            result += new Error("ContentType must be a valid MIME type.", nameof(ContentType));
        if (string.IsNullOrWhiteSpace(FileName))
            result += new Error("File name is required.", nameof(FileName));
        else if (FileName.Length > 255)
            result += new Error("FileName cannot exceed 255 characters.", nameof(FileName));
        if (Stream is null)
            result += new Error("Stream cannot be null.", nameof(Stream));
        else if (!Stream.CanRead)
            result += new Error("Stream must be readable.", nameof(Stream));
        else if (Stream.CanSeek && Stream.Length > _maxFileSizeBytes)
            result += new Error("File size cannot exceed 100 MB.", nameof(Stream));
        return result;
    }
}