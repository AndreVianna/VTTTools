namespace VttTools.Library.Stages.Model;

public class StageWallTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var wall = new StageWall();

        // Assert
        wall.Index.Should().Be(0);
        wall.Name.Should().BeNull();
        wall.Segments.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var segments = new List<StageWallSegment> {
            new() { Index = 0, Name = "Segment 1" },
            new() { Index = 1, Name = "Segment 2" },
        };

        // Act
        var wall = new StageWall {
            Index = 5,
            Name = "Main Wall",
            Segments = segments,
        };

        // Assert
        wall.Index.Should().Be(5);
        wall.Name.Should().Be("Main Wall");
        wall.Segments.Should().HaveCount(2);
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new StageWall {
            Index = 0,
            Name = "Original Wall",
        };

        // Act
        var modified = original with { Name = "Modified Wall" };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.Name.Should().Be("Modified Wall");
        modified.Index.Should().Be(0);
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        var wall1 = new StageWall {
            Index = 0,
            Name = "Test Wall",
        };
        var wall2 = new StageWall {
            Index = 0,
            Name = "Test Wall",
        };

        // Act & Assert
        wall1.Should().Be(wall2);
        (wall1 == wall2).Should().BeTrue();
    }

    [Fact]
    public void StageWallSegment_Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var segment = new StageWallSegment();

        // Assert
        segment.Index.Should().Be(0);
        segment.Name.Should().BeNull();
        segment.StartPole.Should().Be(new Pole(0, 0, 0));
        segment.EndPole.Should().Be(new Pole(0, 0, 0));
        segment.Type.Should().Be(SegmentType.Wall);
        segment.IsOpaque.Should().BeFalse();
        segment.State.Should().Be(SegmentState.Open);
    }

    [Fact]
    public void StageWallSegment_Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var startPole = new Pole(0, 0, 10);
        var endPole = new Pole(100, 0, 10);

        // Act
        var segment = new StageWallSegment {
            Index = 1,
            Name = "Door Segment",
            StartPole = startPole,
            EndPole = endPole,
            Type = SegmentType.Door,
            IsOpaque = true,
            State = SegmentState.Locked,
        };

        // Assert
        segment.Index.Should().Be(1);
        segment.Name.Should().Be("Door Segment");
        segment.StartPole.Should().Be(startPole);
        segment.EndPole.Should().Be(endPole);
        segment.Type.Should().Be(SegmentType.Door);
        segment.IsOpaque.Should().BeTrue();
        segment.State.Should().Be(SegmentState.Locked);
    }
}