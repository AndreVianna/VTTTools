namespace VttTools.Utilities;

public class ErrorCollectionExtensionsTests {
    [Fact]
    public void GroupedBySource_WithMultipleErrors_GroupsBySource() {
        // Arrange
        var errors = new List<Error> {
            new("Error 1", ["source1", "source2"]),
            new("Error 2", ["source2", "source3"]),
            new("Error 3", ["source1"])
        };

        // Act
        var result = errors.GroupedBySource();

        // Assert
        result.Should().ContainKey("source1");
        result.Should().ContainKey("source2");
        result.Should().ContainKey("source3");

        result["source1"].Should().Contain("Error 1");
        result["source1"].Should().Contain("Error 3");
        result["source2"].Should().Contain("Error 1");
        result["source2"].Should().Contain("Error 2");
        result["source3"].Should().Contain("Error 2");
    }

    [Fact]
    public void GroupedBySource_WithEmptyErrors_ReturnsEmptyDictionary() {
        // Arrange
        var errors = new List<Error>();

        // Act
        var result = errors.GroupedBySource();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void GroupedBySource_WithSingleSource_GroupsCorrectly() {
        // Arrange
        var errors = new List<Error> {
            new("Error 1", ["source1"]),
            new("Error 2", ["source1"]),
            new("Error 3", ["source1"])
        };

        // Act
        var result = errors.GroupedBySource();

        // Assert
        result.Should().ContainKey("source1");
        result["source1"].Should().HaveCount(3);
        result["source1"].Should().Contain("Error 1");
        result["source1"].Should().Contain("Error 2");
        result["source1"].Should().Contain("Error 3");
    }

    [Fact]
    public void GroupedBySource_WithCaseSensitiveKeys_MaintainsCaseSensitivity() {
        // Arrange
        var errors = new List<Error> {
            new("Error 1", ["Source1"]),
            new("Error 2", ["source1"])
        };

        // Act
        var result = errors.GroupedBySource();

        // Assert
        result.Should().ContainKey("Source1");
        result.Should().ContainKey("source1");
        result["Source1"].Should().Contain("Error 1");
        result["source1"].Should().Contain("Error 2");
    }
}