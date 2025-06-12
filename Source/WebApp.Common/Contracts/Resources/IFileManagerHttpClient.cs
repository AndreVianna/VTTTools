namespace VttTools.WebApp.Contracts.Resources;

public interface IFileManagerHttpClient {
    Task<Result<Resource>> UploadFileAsync(string type, Guid id, string resource, Stream fileStream, string fileName);
}
