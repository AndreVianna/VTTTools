namespace VttTools.Contracts.Game;

public class UpdateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateAssetRequest {
            Name = "Subject",
            Type = AssetType.Creature,
            Source = "http://sorce.net/image.png",
            Visibility = Visibility.Private,
        };
        const string name = "Other Subject";
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
        data.Name.Value.Should().Be(name);
        data.Type.Value.Should().Be(type);
        data.Source.Value.Should().Be(source);
        data.Visibility.Value.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = "Updated Asset",
            Source = "updated -source.png",
            Type = AssetType.Character,
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyName_ReturnsError(string? name) {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = name!,
            Source = "source .png",
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Asset name cannot be null or empty." && e.Sources.Contains(nameof(request.Name)));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptySource_ReturnsError(string? source) {
        // Arrange
        var request = new UpdateAssetRequest {
            Name = "Asset Subject",
            Source = source!,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Asset source cannot be null or empty." && e.Sources.Contains(nameof(request.Source)));
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