namespace VttTools.AI.Clients;

public class JobsServiceClient(IHttpClientFactory httpClientFactory,
                               ILogger<JobsServiceClient> logger)
    : IJobsServiceClient {
    public async Task<Job?> AddAsync(Guid ownerId, AddJobRequest request, CancellationToken ct = default) {
        var requestWithOwner = request with { OwnerId = ownerId };
        var httpClient = httpClientFactory.CreateClient("JobsService");
        var response = await httpClient.PostAsJsonAsync("/api/jobs", requestWithOwner, JsonDefaults.Options, ct);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Job>(JsonDefaults.Options, ct);

        var body = await response.Content.ReadAsStringAsync(ct);
        logger.LogError("Job add failed with status {StatusCode} for job type {Type}: {Body}",
                        response.StatusCode,
                        request.Type,
                        body);
        return null;
    }

    public async Task<Job?> GetByIdAsync(Guid jobId, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("JobsService");
        var response = await httpClient.GetAsync($"/api/jobs/{jobId}", ct);
        if (response.IsSuccessStatusCode)
            return await response.Content.ReadFromJsonAsync<Job>(JsonDefaults.Options, ct);

        logger.LogError("Job retrieval failed with status {StatusCode} for job {Id}",
                        response.StatusCode,
                        jobId);
        return null;
    }

    public async Task<bool> UpdateAsync(Guid jobId, UpdateJobRequest request, CancellationToken ct = default) {
        var httpClient = httpClientFactory.CreateClient("JobsService");
        var response = await httpClient.PatchAsJsonAsync($"/api/jobs/{jobId}", request, JsonDefaults.Options, ct);
        if (response.IsSuccessStatusCode)
            return true;

        var body = await response.Content.ReadAsStringAsync(ct);
        logger.LogError("Job update failed with status {StatusCode} for job {JobId}: {Body}",
                        response.StatusCode,
                        jobId,
                        body);
        return false;
    }
}