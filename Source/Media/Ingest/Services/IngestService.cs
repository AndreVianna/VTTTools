using System.Text.Json;
using VttTools.Jobs.ApiContracts;
using VttTools.Json;
using VttTools.Media.Ingest.Clients;

namespace VttTools.Media.Ingest.Services;

/// <summary>
/// Service for coordinating AI image generation ingest for assets.
/// </summary>
public sealed class IngestService(
    IJobsServiceClient jobsClient,
    IngestProcessingQueue processingQueue,
    ILogger<IngestService> logger)
    : IIngestService {

    public const string JobTypeName = "AssetImageIngest";

    public async Task<Result<IngestJobResponse>> StartIngestAsync(StartIngestData data, CancellationToken ct = default) {
        if (data.Items.Count == 0)
            return Result.Failure("At least one item is required.").WithNo<IngestJobResponse>();

        try {
            // Create job items - one per asset, containing all generation requests
            var jobItems = new List<AddJobRequest.Item>();
            var assetIds = new List<Guid>();
            var itemIndex = 0;

            foreach (var item in data.Items) {
                assetIds.Add(item.AssetId);

                // Expand to individual generation items (Portrait and/or Token)
                if (item.GeneratePortrait) {
                    jobItems.Add(CreateJobItem(itemIndex++, item, "Portrait"));
                }
                if (item.GenerateToken) {
                    jobItems.Add(CreateJobItem(itemIndex++, item, "Token"));
                }
            }

            // Estimate duration based on item count (rough estimate: 30s per image)
            var estimatedDuration = TimeSpan.FromSeconds(jobItems.Count * 30);

            var addJobRequest = new AddJobRequest {
                Type = JobTypeName,
                EstimatedDuration = estimatedDuration,
                Items = jobItems,
            };

            var job = await jobsClient.AddAsync(data.OwnerId, addJobRequest, ct);
            if (job is null) {
                logger.LogError("Failed to create ingest job");
                return Result.Failure("Failed to create job").WithNo<IngestJobResponse>();
            }

            // Queue the job for background processing
            await processingQueue.EnqueueAsync(new IngestQueueItem {
                JobId = job.Id,
                OwnerId = data.OwnerId,
            }, ct);

            logger.LogInformation("Started ingest job {JobId} with {ItemCount} items for {AssetCount} assets",
                job.Id, jobItems.Count, assetIds.Count);

            return new IngestJobResponse {
                JobId = job.Id,
                ItemCount = jobItems.Count,
                AssetIds = assetIds,
            };
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error starting ingest job");
            return Result.Failure(ex.Message).WithNo<IngestJobResponse>();
        }
    }

    private static AddJobRequest.Item CreateJobItem(int index, IngestItemData item, string generationType) {
        var itemData = new IngestJobItemData {
            AssetId = item.AssetId,
            Name = item.Name,
            Kind = item.Kind,
            Category = item.Category,
            Type = item.Type,
            Subtype = item.Subtype,
            Description = item.Description,
            Environment = item.Environment,
            Tags = item.Tags,
            GenerationType = generationType,
            TemplateId = item.TemplateId,
        };

        return new AddJobRequest.Item {
            Index = index,
            Data = JsonSerializer.Serialize(itemData, JsonDefaults.Options),
        };
    }
}

/// <summary>
/// Serialized data for a single job item.
/// </summary>
internal sealed record IngestJobItemData {
    public required Guid AssetId { get; init; }
    public required string Name { get; init; }
    public required AssetKind Kind { get; init; }
    public string? Category { get; init; }
    public string? Type { get; init; }
    public string? Subtype { get; init; }
    public string? Description { get; init; }
    public string? Environment { get; init; }
    public string[] Tags { get; init; } = [];
    public required string GenerationType { get; init; }
    public Guid? TemplateId { get; init; }
}
