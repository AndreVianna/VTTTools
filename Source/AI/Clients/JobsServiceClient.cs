namespace VttTools.AI.Clients;

public class JobsServiceClient(
    HttpClient httpClient,
    IHttpContextAccessor httpContextAccessor,
    ILogger<JobsServiceClient> logger) {
    public async Task<Guid?> CreateJobAsync(CreateJobRequest request, CancellationToken ct = default) {
        AddAuthorizationHeader();
        var response = await httpClient.PostAsJsonAsync("/api/jobs", request, ct);
        if (!response.IsSuccessStatusCode) {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError(
                "Job creation failed with status {StatusCode} for job type {Type}: {Body}",
                response.StatusCode,
                request.Type,
                body);
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<JobResponse>(ct);
        return result?.Id;
    }

    private void AddAuthorizationHeader(string? authToken = null) {
        var authHeader = authToken ?? httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader)) {
            httpClient.DefaultRequestHeaders.Authorization =
                AuthenticationHeaderValue.Parse(authHeader);
        }
    }

    public async Task<JobResponse?> GetJobByIdAsync(Guid jobId, CancellationToken ct = default, string? authToken = null) {
        AddAuthorizationHeader(authToken);
        var response = await httpClient.GetAsync($"/api/jobs/{jobId}", ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job retrieval failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return null;
        }

        return await response.Content.ReadFromJsonAsync<JobResponse>(ct);
    }

    public async Task<bool> CancelJobAsync(Guid jobId, CancellationToken ct = default, string? authToken = null) {
        AddAuthorizationHeader(authToken);
        var response = await httpClient.DeleteAsync($"/api/jobs/{jobId}", ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job cancellation failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return false;
        }

        return true;
    }

    public async Task<bool> RetryJobAsync(Guid jobId, CancellationToken ct = default, string? authToken = null) {
        AddAuthorizationHeader(authToken);
        var response = await httpClient.PostAsync($"/api/jobs/{jobId}/retry", content: null, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job retry failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return false;
        }

        return true;
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetJobItemsAsync(
        Guid jobId,
        JobItemStatus? status = null,
        CancellationToken ct = default,
        string? authToken = null) {
        AddAuthorizationHeader(authToken);
        var url = $"/api/jobs/{jobId}/items";
        if (status.HasValue) {
            url = $"{url}?status={status.Value}";
        }

        var response = await httpClient.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job items retrieval failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return [];
        }

        var result = await response.Content.ReadFromJsonAsync<IReadOnlyList<JobItemResponse>>(ct);
        return result ?? [];
    }

    public async Task<bool> UpdateItemStatusAsync(
        Guid jobId,
        int itemIndex,
        UpdateJobItemStatusRequest request,
        CancellationToken ct = default,
        string? authToken = null) {
        AddAuthorizationHeader(authToken);
        var response = await httpClient.PatchAsJsonAsync($"/api/jobs/{jobId}/items/{itemIndex}", request, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job item status update failed with status {StatusCode} for job {JobId} item {ItemIndex}",
                response.StatusCode,
                jobId,
                itemIndex);
            return false;
        }

        return true;
    }

    public async Task<bool> BroadcastProgressAsync(
        BroadcastProgressRequest request,
        CancellationToken ct = default,
        string? authToken = null) {
        AddAuthorizationHeader(authToken);
        var response = await httpClient.PostAsJsonAsync("/api/jobs/progress", request, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Progress broadcast failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                request.JobId);
            return false;
        }

        return true;
    }
}
