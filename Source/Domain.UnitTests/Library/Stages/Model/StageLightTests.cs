namespace VttTools.Library.Stages.Model;

public class StageLightTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var light = new StageLight();

        // Assert
        light.Index.Should().Be(0);
        light.Name.Should().BeNull();
        light.Type.Should().Be(LightSourceType.Natural);
        light.Position.Should().Be(Point.Zero);
        light.Range.Should().Be(0f);
        light.Direction.Should().BeNull();
        light.Arc.Should().BeNull();
        light.Color.Should().BeNull();
        light.IsOn.Should().BeTrue();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var position = new Point(50, 75);

        // Act
        var light = new StageLight {
            Index = 2,
            Name = "Torch AmbientLight",
            Type = LightSourceType.Artificial,
            Position = position,
            Range = 30f,
            Direction = 45f,
            Arc = 90f,
            Color = "#FF8800",
            IsOn = false,
        };

        // Assert
        light.Index.Should().Be(2);
        light.Name.Should().Be("Torch AmbientLight");
        light.Type.Should().Be(LightSourceType.Artificial);
        light.Position.Should().Be(position);
        light.Range.Should().Be(30f);
        light.Direction.Should().Be(45f);
        light.Arc.Should().Be(90f);
        light.Color.Should().Be("#FF8800");
        light.IsOn.Should().BeFalse();
    }

    [Fact]
    public void Record_WithExpression_CreatesNewInstance() {
        // Arrange
        var original = new StageLight {
            Index = 0,
            Name = "Original AmbientLight",
            IsOn = true,
        };

        // Act
        var modified = original with { IsOn = false };

        // Assert
        modified.Should().NotBeSameAs(original);
        modified.IsOn.Should().BeFalse();
        modified.Name.Should().Be("Original AmbientLight");
    }

    [Fact]
    public void Record_Equality_WorksCorrectly() {
        // Arrange
        var light1 = new StageLight {
            Index = 0,
            Name = "Test AmbientLight",
            Type = LightSourceType.Artificial,
        };
        var light2 = new StageLight {
            Index = 0,
            Name = "Test AmbientLight",
            Type = LightSourceType.Artificial,
        };

        // Act & Assert
        light1.Should().Be(light2);
        (light1 == light2).Should().BeTrue();
    }

    [Theory]
    [InlineData(LightSourceType.Natural)]
    [InlineData(LightSourceType.Artificial)]
    [InlineData(LightSourceType.Supernatural)]
    public void Type_AcceptsAllLightSourceTypeValues(LightSourceType type) {
        // Arrange & Act
        var light = new StageLight { Type = type };

        // Assert
        light.Type.Should().Be(type);
    }

    [Theory]
    [InlineData(10f)]
    [InlineData(30f)]
    [InlineData(60f)]
    public void Range_AcceptsValidValues(float range) {
        // Arrange & Act
        var light = new StageLight { Range = range };

        // Assert
        light.Range.Should().Be(range);
    }

    [Theory]
    [InlineData("#FFFFFF")]
    [InlineData("#FF0000")]
    [InlineData("#00FF00")]
    [InlineData("#0000FF")]
    [InlineData("#FFB347")]
    public void Color_AcceptsValidHexValues(string color) {
        // Arrange & Act
        var light = new StageLight { Color = color };

        // Assert
        light.Color.Should().Be(color);
    }

    [Fact]
    public void OmnidirectionalLight_HasNoDirectionOrArc() {
        // Arrange & Act
        var light = new StageLight {
            Type = LightSourceType.Artificial,
            Range = 30f,
            Direction = null,
            Arc = null,
        };

        // Assert
        light.Direction.Should().BeNull();
        light.Arc.Should().BeNull();
    }

    [Fact]
    public void DirectionalLight_HasDirectionAndArc() {
        // Arrange & Act
        var light = new StageLight {
            Type = LightSourceType.Supernatural,
            Range = 60f,
            Direction = 90f,
            Arc = 120f,
        };

        // Assert
        light.Direction.Should().Be(90f);
        light.Arc.Should().Be(120f);
    }
}