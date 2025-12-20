namespace VttTools.AI.Clients;

public class ResourceServiceClient(IHttpClientFactory httpClientFactory,
                                   ILogger<ResourceServiceClient> logger)
    : IResourceServiceClient {

    public async Task<Guid?> UploadImageAsync(
        Guid ownerId,
        byte[] imageData,
        string fileName,
        string contentType,
        ResourceType resourceType,
        ResourceClassification? classification = null,
        string? description = null,
        CancellationToken ct = default) {

        using var content = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(imageData);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(fileContent, "file", fileName);
        content.Add(new StringContent(resourceType.ToString()), "resourceType");
        content.Add(new StringContent(ownerId.ToString()), "ownerId");

        if (classification is not null) {
            content.Add(new StringContent(classification.Kind), "kind");
            content.Add(new StringContent(classification.Category), "category");
            content.Add(new StringContent(classification.Type), "type");
            if (!string.IsNullOrWhiteSpace(classification.Subtype))
                content.Add(new StringContent(classification.Subtype), "subtype");
        }

        if (!string.IsNullOrWhiteSpace(description))
            content.Add(new StringContent(description), "description");

        var httpClient = httpClientFactory.CreateClient("ResourcesService");
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

        var result = await response.Content.ReadFromJsonAsync<ResourceUploadResponse>(JsonDefaults.Options, ct);
        return result?.Id;
    }

    private sealed record ResourceUploadResponse(Guid Id);
}
