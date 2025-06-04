namespace VttTools.WebApp.Server.Clients;

public class ServerFileManagerHttpClient(HttpClient client, JsonSerializerOptions options)
    : IServerFileManagerHttpClient {
    public async Task<Result<ResourceInfo>> UploadFileAsync(string type, Guid id, string resource, Stream fileStream, string fileName) {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);
        content.Add(streamContent, "file", fileName);
        var response = await client.PostAsync($"api/upload/{type}/{id}/{resource}", content);
        response.EnsureSuccessStatusCode();
        return IsNotNull(await response.Content.ReadFromJsonAsync<ResourceInfo>(options));
    }
}
