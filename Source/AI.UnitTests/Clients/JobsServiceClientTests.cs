
namespace VttTools.AI.UnitTests.Clients;

public sealed class JobsServiceClientTests
    : IDisposable {
    private readonly MockHttpMessageHandler _mockHandler;
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<JobsServiceClient> _logger;
    private readonly JobsServiceClient _client;
    private readonly CancellationToken _ct;

    public JobsServiceClientTests() {
        _mockHandler = new MockHttpMessageHandler();
        _httpClient = new HttpClient(_mockHandler) {
            BaseAddress = new Uri("http://localhost:5000"),
        };
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        _logger = Substitute.For<ILogger<JobsServiceClient>>();
        _client = new JobsServiceClient(_httpClient, _httpContextAccessor, _logger);
        _ct = TestContext.Current.CancellationToken;
    }

    private bool _isDisposed;
    public void Dispose() {
        if (_isDisposed)
            return;
        _httpClient.Dispose();
        GC.SuppressFinalize(this);
        _isDisposed = true;
    }

    [Fact]
    public async Task CreateJobAsync_WithValidRequest_ReturnsJobId() {
        var request = new CreateJobRequest {
            Type = "BulkAssetGeneration",
            InputJson = "{}",
            TotalItems = 5,
        };
        var expectedJobId = Guid.CreateVersion7();
        var response = new JobResponse {
            Id = expectedJobId,
            Type = "BulkAssetGeneration",
            Status = JobStatus.Pending,
            TotalItems = 5,
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK, response);

        var result = await _client.CreateJobAsync(request, _ct);

        result.Should().Be(expectedJobId);
    }

    [Fact]
    public async Task CreateJobAsync_WhenRequestFails_ReturnsNull() {
        var request = new CreateJobRequest {
            Type = "BulkAssetGeneration",
            InputJson = "{}",
            TotalItems = 5,
        };

        _mockHandler.SetupResponse(HttpStatusCode.BadRequest);

        var result = await _client.CreateJobAsync(request, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetJobByIdAsync_WithValidJobId_ReturnsJobResponse() {
        var jobId = Guid.CreateVersion7();
        var response = new JobResponse {
            Id = jobId,
            Type = "BulkAssetGeneration",
            Status = JobStatus.InProgress,
            TotalItems = 10,
            CompletedItems = 5,
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK, response);

        var result = await _client.GetJobByIdAsync(jobId, _ct);

        result.Should().NotBeNull();
        result!.Id.Should().Be(jobId);
        result.Status.Should().Be(JobStatus.InProgress);
        result.CompletedItems.Should().Be(5);
    }

    [Fact]
    public async Task GetJobByIdAsync_WhenJobNotFound_ReturnsNull() {
        var jobId = Guid.CreateVersion7();

        _mockHandler.SetupResponse(HttpStatusCode.NotFound);

        var result = await _client.GetJobByIdAsync(jobId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateJobStatusAsync_WithValidRequest_ReturnsTrue() {
        var jobId = Guid.CreateVersion7();
        var request = new UpdateJobStatusRequest {
            Status = JobStatus.InProgress,
            StartedAt = DateTime.UtcNow,
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK);

        var result = await _client.UpdateJobStatusAsync(jobId, request, _ct);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateJobStatusAsync_WhenRequestFails_ReturnsFalse() {
        var jobId = Guid.CreateVersion7();
        var request = new UpdateJobStatusRequest {
            Status = JobStatus.InProgress,
        };

        _mockHandler.SetupResponse(HttpStatusCode.BadRequest);

        var result = await _client.UpdateJobStatusAsync(jobId, request, _ct);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateJobCountsAsync_WithValidRequest_ReturnsTrue() {
        var jobId = Guid.CreateVersion7();
        var request = new UpdateJobCountsRequest {
            CompletedItems = 8,
            FailedItems = 2,
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK);

        var result = await _client.UpdateJobCountsAsync(jobId, request, _ct);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateItemStatusAsync_WithValidRequest_ReturnsTrue() {
        var itemId = Guid.CreateVersion7();
        var request = new UpdateJobItemStatusRequest {
            Status = JobItemStatus.Completed,
            CompletedAt = DateTime.UtcNow,
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK);

        var result = await _client.UpdateItemStatusAsync(itemId, request, _ct);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetPendingItemsAsync_WithValidJobId_ReturnsItems() {
        var jobId = Guid.CreateVersion7();
        var items = new List<JobItemResponse> {
            new() {
                ItemId = Guid.CreateVersion7(),
                JobId = jobId,
                Index = 0,
                Status = JobItemStatus.Pending,
            },
            new() {
                ItemId = Guid.CreateVersion7(),
                JobId = jobId,
                Index = 1,
                Status = JobItemStatus.Pending,
            },
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK, items);

        var result = await _client.GetPendingItemsAsync(jobId, _ct);

        result.Should().HaveCount(2);
        result[0].Status.Should().Be(JobItemStatus.Pending);
    }

    [Fact]
    public async Task GetPendingItemsAsync_WhenRequestFails_ReturnsEmptyList() {
        var jobId = Guid.CreateVersion7();

        _mockHandler.SetupResponse(HttpStatusCode.InternalServerError);

        var result = await _client.GetPendingItemsAsync(jobId, _ct);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetFailedItemsAsync_WithoutItemIds_ReturnsAllFailedItems() {
        var jobId = Guid.CreateVersion7();
        var items = new List<JobItemResponse> {
            new() {
                ItemId = Guid.CreateVersion7(),
                JobId = jobId,
                Index = 0,
                Status = JobItemStatus.Failed,
                ErrorMessage = "Error 1",
            },
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK, items);

        var result = await _client.GetFailedItemsAsync(jobId, null, _ct);

        result.Should().HaveCount(1);
        result[0].Status.Should().Be(JobItemStatus.Failed);
    }

    [Fact]
    public async Task GetFailedItemsAsync_WithItemIds_ReturnsFilteredItems() {
        var jobId = Guid.CreateVersion7();
        var itemIds = new[] { Guid.CreateVersion7(), Guid.CreateVersion7() };
        var items = new List<JobItemResponse> {
            new() {
                ItemId = itemIds[0],
                JobId = jobId,
                Index = 0,
                Status = JobItemStatus.Failed,
            },
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK, items);

        var result = await _client.GetFailedItemsAsync(jobId, itemIds, _ct);

        result.Should().HaveCount(1);
    }

    [Fact]
    public async Task BroadcastProgressAsync_WithValidRequest_ReturnsTrue() {
        var request = new BroadcastProgressRequest {
            JobId = Guid.CreateVersion7(),
            Type = "BulkAssetGeneration",
            ItemIndex = 5,
            ItemStatus = JobItemStatus.Processing,
            Message = "Processing item 5",
            CurrentItem = 5,
            TotalItems = 10,
        };

        _mockHandler.SetupResponse(HttpStatusCode.OK);

        var result = await _client.BroadcastProgressAsync(request, _ct);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task BroadcastProgressAsync_WhenRequestFails_ReturnsFalse() {
        var request = new BroadcastProgressRequest {
            JobId = Guid.CreateVersion7(),
            Type = "BulkAssetGeneration",
            ItemIndex = 5,
            ItemStatus = JobItemStatus.Processing,
            Message = "Processing",
            CurrentItem = 5,
            TotalItems = 10,
        };

        _mockHandler.SetupResponse(HttpStatusCode.InternalServerError);

        var result = await _client.BroadcastProgressAsync(request, _ct);

        result.Should().BeFalse();
    }
}
