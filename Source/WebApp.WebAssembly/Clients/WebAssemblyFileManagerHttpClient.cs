namespace VttTools.WebApp.WebAssembly.Clients;

public class WebAssemblyFileManagerHttpClient(HttpClient client, JsonSerializerOptions options)
    : IWebAssemblyFileManagerHttpClient
{
    public async Task<Result<Resource>> UploadFileAsync(string type, Guid id, string resource, Stream fileStream, string fileName)
    {
        using var content = new MultipartFormDataContent();
        using var streamContent = new StreamContent(fileStream);
        content.Add(streamContent, "file", fileName);
        var response = await client.PostAsync($"api/upload/{type}/{id}/{resource}", content);
        response.EnsureSuccessStatusCode();
        return IsNotNull(await response.Content.ReadFromJsonAsync<Resource>(options));
    }
}
