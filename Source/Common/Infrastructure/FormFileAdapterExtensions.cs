namespace VttTools.Infrastructure;

/// <summary>
/// Extension methods for IFormFile to IFileData conversion.
/// </summary>
public static class FormFileAdapterExtensions {
    /// <summary>
    /// Converts an IFormFile to the platform-agnostic IFileData interface.
    /// </summary>
    /// <param name="formFile">The IFormFile to convert.</param>
    /// <returns>An IFileData instance wrapping the IFormFile.</returns>
    public static IFileData ToFileData(this IFormFile formFile) => new FormFileAdapter(formFile);
}