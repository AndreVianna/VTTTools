namespace VttTools.WebApp.Client.Clients;

public class AssetsClientHttpClient(HttpClient httpClient, JsonSerializerOptions options)
    : IAssetsClientHttpClient {
    public Task<Asset?> GetAssetByIdAsync(Guid id)
        => httpClient.GetFromJsonAsync<Asset>($"api/assets/{id}", options);

    public async Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request) {
        var response = await httpClient.PostAsJsonAsync("api/assets", request, options);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset");

        var result = await response.Content.ReadFromJsonAsync<Asset>();
        return Result.Success(result!);
    }

    public async Task<string> UploadAssetFileAsync(Guid assetId, Stream fileStream, string fileName) {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);

        content.Add(streamContent, "file", fileName);

        var response = await httpClient.PostAsync($"api/assets/{assetId}/upload", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}