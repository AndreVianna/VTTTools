namespace VttTools.WebApp.Client.Clients;

public class AssetsClient(HttpClient httpClient)
    : IAssetsClient
{
    public Task<Asset?> GetAssetByIdAsync(Guid id)
        => httpClient.GetFromJsonAsync<Asset>($"api/assets/{id}");

    public async Task<Result<Asset>> CreateAssetAsync(CreateAssetRequest request)
    {
        var response = await httpClient.PostAsJsonAsync("api/assets", request);
        if (!response.IsSuccessStatusCode)
            return Result.Failure("Failed to create asset");

        var result = await response.Content.ReadFromJsonAsync<Asset>();
        return Result.Success(result!);
    }

    public async Task<string> UploadAssetFileAsync(Guid assetId, Stream fileStream, string fileName)
    {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);

        content.Add(streamContent, "file", fileName);

        var response = await httpClient.PostAsync($"api/assets/{assetId}/upload", content);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync();
    }
}