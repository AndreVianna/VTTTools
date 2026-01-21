namespace VttTools.Library.Content.ServiceContracts;

public class ContentFiltersTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var filters = new ContentFilters();

        // Assert
        filters.After.Should().BeNull();
        filters.Limit.Should().Be(20);
        filters.ContentType.Should().BeNull();
        filters.IsOneShot.Should().BeNull();
        filters.MinEncounterCount.Should().BeNull();
        filters.MaxEncounterCount.Should().BeNull();
        filters.Style.Should().BeNull();
        filters.IsPublished.Should().BeNull();
        filters.Search.Should().BeNull();
        filters.Owner.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var afterId = Guid.CreateVersion7();

        // Act
        var filters = new ContentFilters {
            After = afterId,
            Limit = 50,
            ContentType = Library.Content.Model.ContentType.Adventure,
            IsOneShot = true,
            MinEncounterCount = 3,
            MaxEncounterCount = 10,
            Style = AdventureStyle.Generic,
            IsPublished = true,
            Search = "dragon",
            Owner = "user123",
        };

        // Assert
        filters.After.Should().Be(afterId);
        filters.Limit.Should().Be(50);
        filters.ContentType.Should().Be(Library.Content.Model.ContentType.Adventure);
        filters.IsOneShot.Should().BeTrue();
        filters.MinEncounterCount.Should().Be(3);
        filters.MaxEncounterCount.Should().Be(10);
        filters.Style.Should().Be(AdventureStyle.Generic);
        filters.IsPublished.Should().BeTrue();
        filters.Search.Should().Be("dragon");
        filters.Owner.Should().Be("user123");
    }

    [Fact]
    public void WithClause_WithChangedAfter_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();
        var afterId = Guid.CreateVersion7();

        // Act
        var updated = original with { After = afterId };

        // Assert
        updated.After.Should().Be(afterId);
        original.After.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedLimit_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { Limit = 100 };

        // Assert
        updated.Limit.Should().Be(100);
        original.Limit.Should().Be(20);
    }

    [Fact]
    public void WithClause_WithChangedContentType_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { ContentType = Library.Content.Model.ContentType.World };

        // Assert
        updated.ContentType.Should().Be(Library.Content.Model.ContentType.World);
        original.ContentType.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedIsOneShot_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { IsOneShot = false };

        // Assert
        updated.IsOneShot.Should().BeFalse();
        original.IsOneShot.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedEncounterCounts_UpdatesProperties() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with {
            MinEncounterCount = 5,
            MaxEncounterCount = 15,
        };

        // Assert
        updated.MinEncounterCount.Should().Be(5);
        updated.MaxEncounterCount.Should().Be(15);
        original.MinEncounterCount.Should().BeNull();
        original.MaxEncounterCount.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedStyle_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { Style = AdventureStyle.OpenWorld };

        // Assert
        updated.Style.Should().Be(AdventureStyle.OpenWorld);
        original.Style.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedIsPublished_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { IsPublished = true };

        // Assert
        updated.IsPublished.Should().BeTrue();
        original.IsPublished.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedSearch_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { Search = "wizard" };

        // Assert
        updated.Search.Should().Be("wizard");
        original.Search.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedOwner_UpdatesProperty() {
        // Arrange
        var original = new ContentFilters();

        // Act
        var updated = original with { Owner = "user456" };

        // Assert
        updated.Owner.Should().Be("user456");
        original.Owner.Should().BeNull();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var afterId = Guid.CreateVersion7();
        var filters1 = new ContentFilters {
            After = afterId,
            Limit = 50,
            ContentType = Library.Content.Model.ContentType.Adventure,
            Search = "dragon",
        };
        var filters2 = new ContentFilters {
            After = afterId,
            Limit = 50,
            ContentType = Library.Content.Model.ContentType.Adventure,
            Search = "dragon",
        };

        // Act & Assert
        filters1.Should().Be(filters2);
        (filters1 == filters2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var filters1 = new ContentFilters { Limit = 20 };
        var filters2 = new ContentFilters { Limit = 50 };

        // Act & Assert
        filters1.Should().NotBe(filters2);
        (filters1 != filters2).Should().BeTrue();
    }
}