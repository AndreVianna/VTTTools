using ResourceEntity = VttTools.Data.Media.Entities.Resource;

namespace VttTools.Data.Media;

public class MediaStorageTests
    : IDisposable {
    private readonly MediaStorage _storage;
    private readonly ApplicationDbContext _context;
    private readonly CancellationToken _ct;

    public MediaStorageTests() {
        _context = DbContextHelper.CreateInMemoryContext(Guid.CreateVersion7());
        _storage = new(_context, NullLogger<MediaStorage>.Instance);
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
        _context.ChangeTracker.Clear();
        var entity = await _context.Resources.AsNoTracking().FirstAsync(_ct);

        var result = await _storage.FindByIdAsync(entity.Id, _ct);

        result.Should().NotBeNull();
        result.Id.Should().Be(entity.Id);
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
            Path = "test/new-resource",
            FileName = "new-resource.png",
            ContentType = "image/png",
            FileSize = 5000,
            Dimensions = new(200, 200),
            Duration = TimeSpan.Zero,
        };

        await _storage.AddAsync(resource, _ct);

        var dbResource = await _context.Resources.FindAsync([resource.Id], _ct);
        dbResource.Should().NotBeNull();
        dbResource.Id.Should().Be(resource.Id);
        dbResource.FileName.Should().Be(resource.FileName);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingResource_ReturnsFalseWhenNoChanges() {
        // UpdateFrom is now a no-op since all resource properties are immutable (set at creation time)
        var entity = CreateTestResource();
        await _context.Resources.AddAsync(entity, _ct);
        await _context.SaveChangesAsync(_ct);

        var resource = new ResourceMetadata {
            Id = entity.Id,
            Path = entity.Path,
            FileName = "updated-filename.png",
            ContentType = entity.ContentType,
            FileSize = entity.FileSize,
            Dimensions = new(entity.Dimensions.Width, entity.Dimensions.Height),
            Duration = entity.Duration,
        };

        _context.ChangeTracker.Clear();

        var result = await _storage.UpdateAsync(resource, _ct);

        // Returns false because UpdateFrom is a no-op (no rows affected)
        result.Should().BeFalse();
        var dbResource = await _context.Resources.FindAsync([resource.Id], _ct);
        dbResource.Should().NotBeNull();
        // FileName remains unchanged since UpdateFrom doesn't modify any fields
        dbResource.FileName.Should().Be(entity.FileName);
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

    private static ResourceEntity CreateTestResource()
        => new() {
            Id = Guid.CreateVersion7(),
            Path = "test/path",
            FileName = $"test-file-{Guid.CreateVersion7():N}.png",
            ContentType = "image/png",
            FileSize = 1000,
            Dimensions = new(100, 100),
            Duration = TimeSpan.Zero,
        };
}