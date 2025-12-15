namespace VttTools.AI.Clients;

public class JobsServiceClient(IHttpClientFactory httpClientFactory,
                               IHttpContextAccessor httpContextAccessor,
                               ILogger<JobsServiceClient> logger)
    : IJobsServiceClient {
    public async Task<Job?> AddAsync(AddJobRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("JobsService");
        AddAuthorizationHeader(httpClient);
        var response = await httpClient.PostAsJsonAsync("/api/jobs", request, ct);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Job>(ct);

        var body = await response.Content.ReadAsStringAsync(ct);
        logger.LogError("Job add or update failed with status {StatusCode} for job type {Type}: {Body}",
                        response.StatusCode,
                        request.Type,
                        body);
        return null;
    }

    public async Task<Job?> GetByIdAsync(Guid jobId, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("JobsService");
        AddAuthorizationHeader(httpClient);
        var response = await httpClient.GetAsync($"/api/jobs/{jobId}", ct);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Job>(ct);

        logger.LogError("Job retrieval failed with status {StatusCode} for job {Id}",
                        response.StatusCode,
                        jobId);
        return null;
    }

    public async Task<bool> UpdateAsync(Guid jobId, UpdateJobRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("JobsService");
        AddAuthorizationHeader(httpClient);
        var response = await httpClient.PatchAsJsonAsync($"/api/jobs/{jobId}", request, ct);
        if (response.IsSuccessStatusCode)
            return true;

        var body = await response.Content.ReadAsStringAsync(ct);
        logger.LogError("Job add or update failed with status {StatusCode} for job {JobId}: {Body}",
                        response.StatusCode,
                        jobId,
                        body);
        return false;
    }

    private void AddAuthorizationHeader(HttpClient httpClient) {
        var authToken = httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authToken))
            throw new InvalidOperationException("Authorization header is missing");
        httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authToken);
    }
}
