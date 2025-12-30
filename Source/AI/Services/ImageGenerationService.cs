namespace VttTools.AI.Services;

public class ImageGenerationService(IAiProviderFactory providerFactory,
                                    IOptions<JobProcessingOptions> options,
                                    IJobsServiceClient jobsClient,
                                    Channel<JobQueueItem> jobChannel,
                                    ILogger<ImageGenerationService> logger)
    : IImageGenerationService {

    private readonly JobProcessingOptions _options = options.Value;

    public IReadOnlyList<string> GetAvailableProviders()
        => providerFactory.GetAvailableImageProviders();

    public async Task<Result<ImageGenerationResponse>> GenerateAsync(ImageGenerationData data, CancellationToken ct = default) {
        var validation = data.Validate();
        if (validation.HasErrors)
            return Result.Failure<ImageGenerationResponse>(null!, validation.Errors);

        var resolvedData = ResolveProviderAndModel(data);
        var provider = providerFactory.GetImageProvider(resolvedData.Provider);

        var stopwatch = Stopwatch.StartNew();
        var result = await provider.GenerateAsync(resolvedData, ct);
        stopwatch.Stop();

        return !result.IsSuccessful
            ? Result.Failure(result.Errors).WithNo<ImageGenerationResponse>()
            : new ImageGenerationResponse {
                ImageData = result.Value,
                ContentType = "image/png",
                InputTokens = 0,
                OutputTokens = 0,
                Cost = 0m,
                Elapsed = stopwatch.Elapsed,
            };
    }

    public async Task<Result<Job>> GenerateManyAsync(Guid ownerId, GenerateManyAssetsData data, CancellationToken ct = default) {
        var context = new Map {
            ["MaxItemsPerBatch"] = _options.MaxItemsPerBatch,
        };
        var validation = data.Validate(context);
        if (validation.HasErrors)
            return Result.Failure(validation.Errors).WithNo<Job>();

        try {
            // Expand items by generation type: 1 input with both types → 2 job items
            var expandedItems = new List<AddJobRequest.Item>();
            var index = 0;
            foreach (var item in data.Items) {
                if (item.GeneratePortrait) {
                    expandedItems.Add(new AddJobRequest.Item {
                        Index = index++,
                        Data = JsonSerializer.Serialize(item with { GenerationType = "Portrait" }, JsonDefaults.Options),
                    });
                }
                if (item.GenerateToken) {
                    expandedItems.Add(new AddJobRequest.Item {
                        Index = index++,
                        Data = JsonSerializer.Serialize(item with { GenerationType = "Token" }, JsonDefaults.Options),
                    });
                }
            }

            var request = new AddJobRequest {
                Type = BulkAssetGenerationHandler.JobTypeName,
                EstimatedDuration = TimeSpan.FromMilliseconds(1500 * expandedItems.Count),
                Items = [.. expandedItems],
            };

            var job = await jobsClient.AddAsync(ownerId, request, ct);
            if (job is null) {
                logger.LogError("Failed to create job via Jobs service");
                return Result.Failure("Failed to create job").WithNo<Job>();
            }
            logger.LogInformation("AI job {Id} created with {ItemCount} items (expanded from {OriginalCount} inputs)",
                job.Id, expandedItems.Count, data.Items.Count);

            var queueItem = new JobQueueItem(job.Id);
            await jobChannel.Writer.WriteAsync(queueItem, ct);

            logger.LogInformation("AI job {Id} queued", job.Id);
            return job;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Failed to start AI job");
            return Result.Failure("Failed to start job").WithNo<Job>();
        }
    }

    private ImageGenerationData ResolveProviderAndModel(ImageGenerationData data) {
        if (!string.IsNullOrEmpty(data.Provider) && !string.IsNullOrEmpty(data.Model))
            return data;

        (var provider, var model) = providerFactory.GetProviderAndModel(data.ContentType);
        return data with {
            Provider = data.Provider ?? provider,
            Model = data.Model ?? model,
        };
    }
}
