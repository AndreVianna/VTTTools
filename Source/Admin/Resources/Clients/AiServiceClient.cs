namespace VttTools.Admin.Resources.Clients;

public class AiServiceClient(
    IHttpClientFactory httpClientFactory,
    IOptions<PublicLibraryOptions> options,
    ILogger<AiServiceClient> logger)
    : IAiServiceClient {

    private readonly Guid _masterUserId = options.Value.MasterUserId;

    public async Task<Result<byte[]>> GenerateImageAsync(ImageGenerationRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AiService");
        httpClient.DefaultRequestHeaders.Add("X-User-Id", _masterUserId.ToString());

        var response = await httpClient.PostAsJsonAsync("/api/ai/images/generate", request, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Image generation failed with status {StatusCode}: {ErrorBody}",
                response.StatusCode,
                errorBody);
            return Result.Failure(errorBody).WithNo<byte[]>();
        }

        var imageData = await response.Content.ReadAsByteArrayAsync(ct);
        return imageData;
    }
}
