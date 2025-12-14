namespace VttTools.AI.Services;

public sealed class AiJobOrchestrationService(
    JobsServiceClient jobsClient,
    Channel<JobQueueItem> jobChannel,
    IHttpContextAccessor httpContextAccessor,
    IOptions<JobProcessingOptions> options,
    ILogger<AiJobOrchestrationService> logger)
    : IAiJobOrchestrationService {

    private readonly JobProcessingOptions _options = options.Value;
    private static readonly JsonSerializerOptions _jsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public async Task<Result<JobResponse>> StartBulkAssetGenerationAsync(
        BulkAssetGenerationData data,
        CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<JobResponse>(null!, validation.Errors);

        if (data.Items.Count > _options.MaxItemsPerBatch) {
            return Result.Failure<JobResponse>(
                null!,
                $"Maximum {_options.MaxItemsPerBatch} items per batch allowed.");
        }

        try {
            var jobInputJson = SerializeJobInput(data);

            var createRequest = new CreateJobRequest {
                Type = BulkAssetGenerationHandler.JobTypeName,
                InputJson = jobInputJson,
                TotalItems = data.Items.Count,
                Items = [.. data.Items.Select((item, index) => new CreateJobItemRequest {
                    Index = index,
                    InputJson = SerializeItemInput(item)
                })]
            };

            var jobId = await jobsClient.CreateJobAsync(createRequest, ct);
            if (jobId is null) {
                logger.LogError("Failed to create job via Jobs service");
                return Result.Failure<JobResponse>(null!, "Failed to create job");
            }

            var authToken = httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
            await jobChannel.Writer.WriteAsync(new JobQueueItem(jobId.Value, authToken), ct);

            logger.LogInformation(
                "AI job {Id} created with {ItemCount} items",
                jobId, data.Items.Count);

            var jobResponse = await jobsClient.GetJobByIdAsync(jobId.Value, ct);
            if (jobResponse is null) {
                logger.LogError("Failed to retrieve created job {Id}", jobId);
                return Result.Failure<JobResponse>(null!, "Failed to retrieve job");
            }

            return jobResponse;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to start AI job");
            return Result.Failure<JobResponse>(null!, "Failed to start job");
        }
    }

    public async Task<JobResponse?> GetJobStatusAsync(
        Guid jobId,
        CancellationToken ct = default)
        => await jobsClient.GetJobByIdAsync(jobId, ct);

    public Task<(IReadOnlyList<JobResponse> Jobs, int TotalCount)> GetJobHistoryAsync(
        string? type = null,
        int skip = 0,
        int take = 20,
        CancellationToken ct = default) {
        logger.LogWarning("GetJobHistoryAsync is deprecated - use Jobs service directly");
        return Task.FromResult<(IReadOnlyList<JobResponse>, int)>(([], 0));
    }

    public async Task<Result> CancelJobAsync(
        Guid jobId,
        CancellationToken ct = default) {
        var success = await jobsClient.CancelJobAsync(jobId, ct);
        if (!success) {
            logger.LogError("Failed to cancel job {Id} via Jobs service", jobId);
            return Result.Failure("Failed to cancel job");
        }

        logger.LogInformation("AI job {Id} cancelled", jobId);
        return Result.Success();
    }

    public async Task<Result<JobResponse>> RetryFailedItemsAsync(
        Guid jobId,
        Guid[]? itemIds = null,
        CancellationToken ct = default) {
        _ = itemIds;

        var success = await jobsClient.RetryJobAsync(jobId, ct);
        if (!success) {
            logger.LogError("Failed to retry job {Id} via Jobs service", jobId);
            return Result.Failure<JobResponse>(null!, "Failed to retry job");
        }

        var authToken = httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
        await jobChannel.Writer.WriteAsync(new JobQueueItem(jobId, authToken), ct);

        logger.LogInformation("Retrying failed items for job {Id}", jobId);

        var updatedJob = await jobsClient.GetJobByIdAsync(jobId, ct);
        return updatedJob ?? Result.Failure<JobResponse>(null!, "Failed to retrieve updated job");
    }

    private static string SerializeJobInput(BulkAssetGenerationData data)
        => JsonSerializer.Serialize(data, _jsonOptions);

    private static string SerializeItemInput(BulkAssetGenerationItemData item)
        => JsonSerializer.Serialize(item, _jsonOptions);
}
