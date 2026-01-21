namespace VttTools.Common.Model;

public class PaginationTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var pagination = new Pagination();

        // Assert
        pagination.Index.Should().Be(0);
        pagination.Size.Should().Be(50);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange & Act
        var pagination = new Pagination(5, 25);

        // Assert
        pagination.Index.Should().Be(5);
        pagination.Size.Should().Be(25);
    }

    [Fact]
    public void WithClause_WithChangedIndex_UpdatesProperty() {
        // Arrange
        var original = new Pagination(0, 50);

        // Act
        var updated = original with { Index = 2 };

        // Assert
        updated.Index.Should().Be(2);
        updated.Size.Should().Be(50);
        original.Index.Should().Be(0);
    }

    [Fact]
    public void WithClause_WithChangedSize_UpdatesProperty() {
        // Arrange
        var original = new Pagination(0, 50);

        // Act
        var updated = original with { Size = 100 };

        // Assert
        updated.Index.Should().Be(0);
        updated.Size.Should().Be(100);
        original.Size.Should().Be(50);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var pagination1 = new Pagination(5, 25);
        var pagination2 = new Pagination(5, 25);

        // Act & Assert
        pagination1.Should().Be(pagination2);
        (pagination1 == pagination2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var pagination1 = new Pagination(5, 25);
        var pagination2 = new Pagination(10, 50);

        // Act & Assert
        pagination1.Should().NotBe(pagination2);
        (pagination1 != pagination2).Should().BeTrue();
    }
}