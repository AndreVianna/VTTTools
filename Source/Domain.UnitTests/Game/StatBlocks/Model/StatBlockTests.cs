namespace VttTools.Game.StatBlocks.Model;

public class StatBlockTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var statBlock = new StatBlock();

        // Assert
        statBlock.Id.Should().NotBeEmpty();
        statBlock.Name.Should().BeEmpty();
        statBlock.CreatedAt.Should().Be(default);
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();
        var createdAt = DateTime.UtcNow;

        // Act
        var statBlock = new StatBlock {
            Id = id,
            Name = "Goblin",
            CreatedAt = createdAt,
        };

        // Assert
        statBlock.Id.Should().Be(id);
        statBlock.Name.Should().Be("Goblin");
        statBlock.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void Id_WhenDefaultConstructor_GeneratesNewGuid() {
        // Arrange & Act
        var statBlock1 = new StatBlock();
        var statBlock2 = new StatBlock();

        // Assert
        statBlock1.Id.Should().NotBeEmpty();
        statBlock2.Id.Should().NotBeEmpty();
        statBlock1.Id.Should().NotBe(statBlock2.Id);
    }

    [Fact]
    public void WithClause_WithChangedName_UpdatesProperty() {
        // Arrange
        var original = new StatBlock { Name = "Goblin" };

        // Act
        var updated = original with { Name = "Hobgoblin" };

        // Assert
        updated.Name.Should().Be("Hobgoblin");
        original.Name.Should().Be("Goblin");
    }

    [Fact]
    public void WithClause_WithChangedCreatedAt_UpdatesProperty() {
        // Arrange
        var original = new StatBlock();
        var newCreatedAt = DateTime.UtcNow;

        // Act
        var updated = original with { CreatedAt = newCreatedAt };

        // Assert
        updated.CreatedAt.Should().Be(newCreatedAt);
        original.CreatedAt.Should().Be(default);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var id = Guid.CreateVersion7();
        var createdAt = DateTime.UtcNow;
        var statBlock1 = new StatBlock {
            Id = id,
            Name = "Goblin",
            CreatedAt = createdAt,
        };
        var statBlock2 = new StatBlock {
            Id = id,
            Name = "Goblin",
            CreatedAt = createdAt,
        };

        // Act & Assert
        statBlock1.Should().Be(statBlock2);
        (statBlock1 == statBlock2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var statBlock1 = new StatBlock { Name = "Goblin" };
        var statBlock2 = new StatBlock { Name = "Hobgoblin" };

        // Act & Assert
        statBlock1.Should().NotBe(statBlock2);
        (statBlock1 != statBlock2).Should().BeTrue();
    }
}
