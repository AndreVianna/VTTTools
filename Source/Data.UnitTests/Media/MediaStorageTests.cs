using ResourceEntity = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Media;

public class MediaStorageTests
    : IDisposable {
    private readonly MediaStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;
    private readonly Guid _ownerId;

    public MediaStorageTests() {
        _ownerId = Guid.CreateVersion7();
        _context = DbContextHelper.CreateInMemoryContext(_ownerId);
        _storage = new(_context);
        _ct = TestContext.Current.CancellationToken;
    }

    public void Dispose() {
        DbContextHelper.Dispose(_context);
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task FilterAsync_SeedingWorks() {
        var entities = await _context.Resources.ToArrayAsync(_ct);

        entities.Should().NotBeEmpty();
    }

    [Fact]
    public async Task FindByIdAsync_WithExistingId_ReturnsResource() {
        var entity = await _context.Resources.FirstAsync(_ct);

        var result = await _storage.FindByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result!.Id.Should().Be(entity.Id);
    }

    [Fact]
    public async Task FindByIdAsync_WithNonExistingId_ReturnsNull() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.FindByIdAsync(nonExistingId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task AddAsync_WithValidResource_AddsToDatabase() {
        var resource = new ResourceMetadata {
            Id = Guid.CreateVersion7(),
            ResourceType = ResourceType.Portrait,
            Path = "test/new-resource",
            FileName = "new-resource.png",
            ContentType = "image/png",
            FileLength = 5000,
            Size = new(200, 200),
            Duration = TimeSpan.Zero,
            OwnerId = _ownerId,
            IsPublic = true,
            IsPublished = false,
        };

        await _storage.AddAsync(resource, _ct);

        var dbResource = await _context.Resources.FindAsync([resource.Id], _ct);
        dbResource.Should().NotBeNull();
        dbResource!.Id.Should().Be(resource.Id);
        dbResource.ResourceType.Should().Be(resource.ResourceType);
        dbResource.FileName.Should().Be(resource.FileName);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingResource_UpdatesInDatabase() {
        var entity = CreateTestResource();
        await _context.Resources.AddAsync(entity, _ct);
        await _context.SaveChangesAsync(_ct);

        var resource = new ResourceMetadata {
            Id = entity.Id,
            ResourceType = entity.ResourceType,
            Path = entity.Path,
            FileName = "updated-filename.png",
            ContentType = entity.ContentType,
            FileLength = entity.FileLength,
            Size = new(entity.Size.Width, entity.Size.Height),
            Duration = entity.Duration,
            OwnerId = entity.OwnerId,
            IsPublic = true,
            IsPublished = true,
        };

        _context.ChangeTracker.Clear();

        var result = await _storage.UpdateAsync(resource, _ct);

        result.Should().BeTrue();
        var dbResource = await _context.Resources.FindAsync([resource.Id], _ct);
        dbResource.Should().NotBeNull();
        dbResource!.FileName.Should().Be("updated-filename.png");
    }

    [Fact]
    public async Task DeleteAsync_WithExistingResource_RemovesFromDatabase() {
        var entity = CreateTestResource();
        await _context.Resources.AddAsync(entity, _ct);
        await _context.SaveChangesAsync(_ct);

        var result = await _storage.DeleteAsync(entity.Id, _ct);

        result.Should().BeTrue();
        var dbResource = await _context.Resources.FindAsync([entity.Id], _ct);
        dbResource.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingId_ReturnsFalse() {
        var nonExistingId = Guid.CreateVersion7();

        var result = await _storage.DeleteAsync(nonExistingId, _ct);

        result.Should().BeFalse();
    }

    private static ResourceEntity CreateTestResource(
        ResourceType? type = null,
        Guid? ownerId = null,
        bool isPublic = false,
        bool isPublished = false) => new() {
            Id = Guid.CreateVersion7(),
            ResourceType = type ?? ResourceType.Background,
            Path = "test/path",
            FileName = $"test-file-{Guid.CreateVersion7():N}.png",
            ContentType = "image/png",
            FileLength = 1000,
            Size = new(100, 100),
            Duration = TimeSpan.Zero,
            OwnerId = ownerId ?? Guid.CreateVersion7(),
            IsPublic = isPublic,
            IsPublished = isPublished,
        };
}