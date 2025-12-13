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

    private void AddAuthorizationHeader() {
        var authHeader = httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader)) {
            httpClient.DefaultRequestHeaders.Authorization =
                AuthenticationHeaderValue.Parse(authHeader);
        }
    }

    public async Task<JobResponse?> GetJobByIdAsync(Guid jobId, CancellationToken ct = default) {
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

    public async Task<bool> UpdateJobStatusAsync(
        Guid jobId,
        UpdateJobStatusRequest request,
        CancellationToken ct = default) {
        var response = await httpClient.PatchAsJsonAsync($"/api/jobs/{jobId}/status", request, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job status update failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return false;
        }

        return true;
    }

    public async Task<bool> UpdateJobCountsAsync(
        Guid jobId,
        UpdateJobCountsRequest request,
        CancellationToken ct = default) {
        var response = await httpClient.PatchAsJsonAsync($"/api/jobs/{jobId}/counts", request, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job counts update failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return false;
        }

        return true;
    }

    public async Task<bool> UpdateItemStatusAsync(
        Guid itemId,
        UpdateJobItemStatusRequest request,
        CancellationToken ct = default) {
        var response = await httpClient.PatchAsJsonAsync($"/api/jobs/items/{itemId}/status", request, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Job item status update failed with status {StatusCode} for item {ItemId}",
                response.StatusCode,
                itemId);
            return false;
        }

        return true;
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetPendingItemsAsync(
        Guid jobId,
        CancellationToken ct = default) {
        var response = await httpClient.GetAsync($"/api/jobs/{jobId}/items/pending", ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Pending items retrieval failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return [];
        }

        var result = await response.Content.ReadFromJsonAsync<IReadOnlyList<JobItemResponse>>(ct);
        return result ?? [];
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetFailedItemsAsync(
        Guid jobId,
        Guid[]? itemIds = null,
        CancellationToken ct = default) {
        var url = $"/api/jobs/{jobId}/items/failed";
        if (itemIds is not null && itemIds.Length > 0) {
            var queryString = string.Join("&", itemIds.Select(id => $"itemIds={id}"));
            url = $"{url}?{queryString}";
        }

        var response = await httpClient.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) {
            logger.LogError(
                "Failed items retrieval failed with status {StatusCode} for job {Id}",
                response.StatusCode,
                jobId);
            return [];
        }

        var result = await response.Content.ReadFromJsonAsync<IReadOnlyList<JobItemResponse>>(ct);
        return result ?? [];
    }

    public async Task<bool> BroadcastProgressAsync(
        BroadcastProgressRequest request,
        CancellationToken ct = default) {
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
