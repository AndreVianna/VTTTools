namespace VttTools.Media.Contracts;

/// <summary>
/// Platform-agnostic interface for file data that eliminates dependency on web-specific types.
/// </summary>
public interface IFileData
{
    /// <summary>
    /// Gets the file name including the extension.
    /// </summary>
    string FileName { get; }

    /// <summary>
    /// Gets the MIME content type of the file.
    /// </summary>
    string ContentType { get; }

    /// <summary>
    /// Gets the length of the file in bytes.
    /// </summary>
    long Length { get; }

    /// <summary>
    /// Opens a stream for reading the file data.
    /// </summary>
    /// <returns>A stream that can be used to read the file data.</returns>
    Stream OpenReadStream();
}