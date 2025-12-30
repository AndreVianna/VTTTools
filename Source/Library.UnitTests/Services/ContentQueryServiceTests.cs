using VttTools.Library.Content.ApiContracts;
using VttTools.Library.Content.ServiceContracts;
using VttTools.Library.Content.Storage;

namespace VttTools.Library.Services;

public class ContentQueryServiceTests {
    private readonly IContentQueryStorage _storage;
    private readonly ContentQueryService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public ContentQueryServiceTests() {
        _storage = Substitute.For<IContentQueryStorage>();
        _service = new(_storage);
        _ct = TestContext.Current.CancellationToken;
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsMoreThanLimit_SetsHasMoreTrue() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(11); // More than limit
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsExactlyLimit_SetsHasMoreFalse() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(10); // Exactly limit
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.HasMore.Should().BeFalse();
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsLessThanLimit_SetsHasMoreFalse() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(5); // Less than limit
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.HasMore.Should().BeFalse();
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsMoreThanLimit_ReturnsOnlyLimitItems() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(15);
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(10);
        result.Data.Should().OnlyContain(item => items.Take(10).Contains(item));
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsData_SetsNextCursorToLastItemId() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(10);
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.NextCursor.Should().Be(items[^1].Id);
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsMoreThanLimit_SetsNextCursorToLimitItemId() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(15);
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.NextCursor.Should().Be(items[9].Id); // 10th item (index 9)
    }

    [Fact]
    public async Task GetContentAsync_WhenStorageReturnsEmpty_SetsHasMoreFalseAndNullCursor() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        ContentListItem[] items = [];
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().BeEmpty();
        result.HasMore.Should().BeFalse();
        result.NextCursor.Should().BeNull();
    }

    [Fact]
    public async Task GetContentAsync_UsesDefaultLimitWhenNotSpecified() {
        // Arrange
        var filters = new ContentFilters(); // Default limit is 20
        var items = CreateTestItems(21);
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(20);
        result.HasMore.Should().BeTrue();
    }

    [Fact]
    public async Task GetContentAsync_PassesFiltersToStorage() {
        // Arrange
        var filters = new ContentFilters {
            Limit = 15,
            After = Guid.CreateVersion7(),
            IsOneShot = true,
            Style = AdventureStyle.Survival,
            IsPublished = true,
            Search = "Dragon",
            Owner = "mine"
        };
        var items = CreateTestItems(10);
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        await _storage.Received(1).QueryContentAsync(_userId, filters, _ct);
    }

    [Fact]
    public async Task GetContentAsync_PassesUserIdToStorage() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(5);
        _storage.QueryContentAsync(userId, filters, _ct).Returns(items);

        // Act
        await _service.GetContentAsync(userId, filters, _ct);

        // Assert
        await _storage.Received(1).QueryContentAsync(userId, filters, _ct);
    }

    [Fact]
    public async Task GetContentAsync_WithSingleItem_SetsNextCursorCorrectly() {
        // Arrange
        var filters = new ContentFilters { Limit = 10 };
        var items = CreateTestItems(1);
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(1);
        result.HasMore.Should().BeFalse();
        result.NextCursor.Should().Be(items[0].Id);
    }

    [Fact]
    public async Task GetContentAsync_WithLimitPlusOne_TruncatesCorrectly() {
        // Arrange
        var filters = new ContentFilters { Limit = 20 };
        var items = CreateTestItems(21); // Exactly limit + 1
        _storage.QueryContentAsync(_userId, filters, _ct).Returns(items);

        // Act
        var result = await _service.GetContentAsync(_userId, filters, _ct);

        // Assert
        result.Data.Should().HaveCount(20);
        result.HasMore.Should().BeTrue();
        result.NextCursor.Should().Be(items[19].Id);
        result.Data.Should().NotContain(items[20]); // Last item should be excluded
    }

    private static ContentListItem[] CreateTestItems(int count) {
        var items = new ContentListItem[count];
        for (var i = 0; i < count; i++) {
            items[i] = new ContentListItem {
                Id = Guid.CreateVersion7(),
                Type = ContentType.Adventure,
                Name = $"Test Item {i}",
                Description = $"Description {i}",
                IsPublished = true,
                OwnerId = Guid.CreateVersion7()
            };
        }
        return items;
    }
}
