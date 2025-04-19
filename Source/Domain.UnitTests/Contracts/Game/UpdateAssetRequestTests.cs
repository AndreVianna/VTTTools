namespace VttTools.Contracts.Game;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Name",
            Type = AssetType.Creature,
            Source = "http://sorce.net/image.png",
            Visibility = Visibility.Private,
        };
        const string name = "Other Name";
        const AssetType type = AssetType.NPC;
        const string source = "http://sorce.net/other-image.png";
        const Visibility visibility = Visibility.Public;

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            Type = type,
            Source = source,
            Visibility = visibility,
        };

        // Assert
        data.Name.Should().Be(name);
        data.Type.Should().Be(type);
        data.Source.Should().Be(source);
        data.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = "Updated Asset",
            Source = "updated-source.png",
            Type = AssetType.Character,
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyName_ReturnsError(string name) {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = name,
            Source = "source.png",
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Asset name cannot be empty." && e.Sources.Contains(nameof(request.Name)));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptySource_ReturnsError(string source) {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = "Asset Name",
            Source = source,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Asset source cannot be empty." && e.Sources.Contains(nameof(request.Source)));
    }

    [Fact]
    public void Validate_WithNullValues_ReturnsSuccess() {
        // Arrange
        var request = new UpdateAssetRequest();

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}