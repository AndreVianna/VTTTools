namespace VttTools.AI.Clients;

public class ResourceServiceClient(
    HttpClient httpClient,
    IHttpContextAccessor httpContextAccessor,
    ILogger<ResourceServiceClient> logger) {

    public async Task<Guid?> UploadImageAsync(
        byte[] imageData,
        string fileName,
        string contentType,
        ResourceType resourceType,
        string? authToken = null,
        CancellationToken ct = default) {
        AddAuthorizationHeader(authToken);

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(imageData);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);
        content.Add(new StringContent(resourceType.ToString()), "resourceType");

        var response = await httpClient.PostAsync("/api/resources", content, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Resource upload failed with status {StatusCode} for file {FileName}: {ErrorBody}",
                response.StatusCode,
                fileName,
                errorBody);
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<ResourceUploadResponse>(ct);
        return result?.Id;
    }

    private sealed record ResourceUploadResponse(Guid Id);

    private void AddAuthorizationHeader(string? authToken = null) {
        var authHeader = authToken ?? httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader))
            httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);
    }
}
