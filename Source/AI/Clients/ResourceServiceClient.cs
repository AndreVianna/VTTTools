namespace VttTools.AI.Clients;

public class ResourceServiceClient(HttpClient httpClient, ILogger<ResourceServiceClient> logger) {
    public async Task<Guid?> UploadImageAsync(byte[] imageData, string fileName, string contentType, CancellationToken ct = default) {
        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(imageData);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);

        var response = await httpClient.PostAsync("/api/resources", content, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Resource upload failed with status {StatusCode} for file {FileName}",
                response.StatusCode,
                fileName);
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<ResourceMetadata>(ct);
        return result?.Id;
    }
}
