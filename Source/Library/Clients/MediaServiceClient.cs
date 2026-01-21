namespace VttTools.Library.Clients;

public class MediaServiceClient(
    IHttpClientFactory httpClientFactory,
    ILogger<MediaServiceClient> logger)
    : IMediaServiceClient {

    public async Task<Result> DeleteResourceAsync(Guid resourceId, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("MediaService");

        var response = await httpClient.DeleteAsync($"/api/resources/{resourceId}", ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Resource deletion failed with status {StatusCode} for resource {ResourceId}: {ErrorBody}",
                response.StatusCode,
                resourceId,
                errorBody);
            var message = string.IsNullOrWhiteSpace(errorBody)
                ? $"Resource deletion failed with status {(int)response.StatusCode}"
                : errorBody;
            return Result.Failure(message);
        }
        return Result.Success();
    }
}