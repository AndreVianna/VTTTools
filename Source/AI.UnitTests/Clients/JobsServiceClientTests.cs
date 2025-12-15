namespace VttTools.AI.Clients;

public sealed class JobsServiceClientTests {
    private readonly JobsServiceClient _client;
    private readonly IHttpClientFactory _httpClientFactory = Substitute.For<IHttpClientFactory>();

    public JobsServiceClientTests() {
        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        var logger = NullLogger<JobsServiceClient>.Instance;
        _client = new JobsServiceClient(_httpClientFactory, httpContextAccessor, logger);
    }

    [Fact]
    public async Task AddJobAsync_WithValidRequest_ReturnsJobId() {
        var request = new AddJobRequest {
            Type = "BulkAssetGeneration",
        };
        var expectedJobId = Guid.CreateVersion7();
        var response = new Job {
            Id = expectedJobId,
            Type = "BulkAssetGeneration",
            Status = JobStatus.Pending,
        };

        using var mockedHandler = new MockHttpMessageHandler<Job>(HttpStatusCode.Created, response);
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient(mockedHandler));

        var result = await _client.AddAsync(request, TestContext.Current.CancellationToken);

        result.Should().Be(expectedJobId);
    }

    [Fact]
    public async Task AddJobAsync_WhenRequestFails_ReturnsNull() {
        var request = new AddJobRequest {
            Type = "BulkAssetGeneration",
        };

        using var mockedHandler = new MockHttpMessageHandler(HttpStatusCode.BadRequest);
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient(mockedHandler));

        var result = await _client.AddAsync(request, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetJobByIdAsync_WithValidJobId_ReturnsJob() {
        var jobId = Guid.CreateVersion7();
        var response = new Job {
            Id = jobId,
            Type = "BulkAssetGeneration",
            Status = JobStatus.InProgress,
        };

        using var mockedHandler = new MockHttpMessageHandler<Job>(HttpStatusCode.OK, response);
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient(mockedHandler));

        var result = await _client.GetByIdAsync(jobId, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Id.Should().Be(jobId);
        result.Status.Should().Be(JobStatus.InProgress);
    }

    [Fact]
    public async Task GetJobByIdAsync_WhenJobNotFound_ReturnsNull() {
        var jobId = Guid.CreateVersion7();

        using var mockedHandler = new MockHttpMessageHandler(HttpStatusCode.NotFound);
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient(mockedHandler));

        var result = await _client.GetByIdAsync(jobId, TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_WithValidRequest_ReturnsTrue() {
        var jobId = Guid.CreateVersion7();
        var request = new UpdateJobRequest {
            Status = JobStatus.InProgress,
        };

        using var mockedHandler = new MockHttpMessageHandler(HttpStatusCode.NoContent);
        _httpClientFactory.CreateClient(Arg.Any<string>()).Returns(new HttpClient(mockedHandler));

        var result = await _client.UpdateAsync(jobId, request, TestContext.Current.CancellationToken);

        result.Should().BeTrue();
    }
}
