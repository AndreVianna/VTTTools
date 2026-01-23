using System.Text.Json;
using VttTools.Json;

namespace VttTools.Media.Ingest.Clients;

/// <summary>
/// HTTP client for calling the AI API to generate images.
/// </summary>
public class AiGenerationClient(
    IHttpClientFactory httpClientFactory,
    ILogger<AiGenerationClient> logger)
    : IAiGenerationClient {

    public async Task<Result<AiGenerationResult>> GenerateImageBytesAsync(
        string prompt,
        GeneratedContentType contentType,
        CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("AiService");

        var request = new GenerateImageBytesRequest {
            Prompt = prompt,
            ContentType = contentType,
            Width = 1024,
            Height = 1024,
        };

        var response = await httpClient.PostAsJsonAsync("/api/ai/images/generate-bytes", request, JsonDefaults.Options, ct);
        if (!response.IsSuccessStatusCode) {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "AI image generation failed with status {StatusCode}: {ErrorBody}",
                response.StatusCode,
                errorBody);
            return Result.Failure($"AI generation failed: {errorBody}").WithNo<AiGenerationResult>();
        }

        var aiResponse = await response.Content.ReadFromJsonAsync<GenerateImageBytesResponse>(JsonDefaults.Options, ct);
        if (aiResponse is null) {
            logger.LogError("Failed to deserialize AI generation response");
            return Result.Failure("Failed to parse AI response").WithNo<AiGenerationResult>();
        }

        var imageData = Convert.FromBase64String(aiResponse.ImageDataBase64);

        return new AiGenerationResult {
            ImageData = imageData,
            ContentType = aiResponse.ContentType,
            Width = aiResponse.Width,
            Height = aiResponse.Height,
            Cost = aiResponse.Cost,
            Elapsed = aiResponse.Elapsed,
        };
    }
}
