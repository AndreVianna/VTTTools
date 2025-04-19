namespace VttTools.Contracts.Game;

public class CreateAssetRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateAssetRequest {
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
        data.Name.Should().Be(name);
        data.Type.Should().Be(type);
        data.Source.Should().Be(source);
        data.Visibility.Should().Be(visibility);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new CreateAssetRequest {
            Name = "Test Asset",
            Source = "test-source.png",
            Type = AssetType.Character,
            Visibility = Visibility.Private,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsSuccess() {
        // Arrange
        var request = new CreateAssetRequest {
            Name = string.Empty,
            Source = "test-source.png",
            Type = AssetType.Placeholder,
            Visibility = Visibility.Hidden,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Asset name cannot be empty." && e.Sources.Contains(nameof(request.Name)));
    }

    [Fact]
    public void Validate_WithEmptySource_ReturnsSuccess() {
        // Arrange
        var request = new CreateAssetRequest {
            Name = "Test Asset",
            Source = string.Empty,
            Type = AssetType.Placeholder,
            Visibility = Visibility.Public,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Asset source cannot be empty." && e.Sources.Contains(nameof(request.Source)));
    }
}