namespace VttTools.Infrastructure;

/// <summary>
/// Adapter that wraps IFormFile to provide platform-agnostic IFileData interface.
/// </summary>
public sealed class FormFileAdapter(IFormFile formFile) : IFileData {
    private readonly IFormFile _formFile = formFile ?? throw new ArgumentNullException(nameof(formFile));

    public string FileName => _formFile.FileName;

    public string ContentType => _formFile.ContentType;

    public long Length => _formFile.Length;

    public Stream OpenReadStream() => _formFile.OpenReadStream();
}