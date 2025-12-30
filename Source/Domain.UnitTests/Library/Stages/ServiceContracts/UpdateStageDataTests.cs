namespace VttTools.Library.Stages.ServiceContracts;

public class UpdateStageDataTests {
    [Fact]
    public void Validate_WithNoUpdates_ReturnsSuccess() {
        // Arrange
        var data = new UpdateStageData();

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithValidName_ReturnsSuccess() {
        // Arrange
        var data = new UpdateStageData {
            Name = "Updated Stage Name",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsError() {
        // Arrange
        var data = new UpdateStageData {
            Name = "",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("When set, the stage name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithWhitespaceName_ReturnsError() {
        // Arrange
        var data = new UpdateStageData {
            Name = "   ",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("When set, the stage name cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithValidDescription_ReturnsSuccess() {
        // Arrange
        var data = new UpdateStageData {
            Description = "Updated description",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithEmptyDescription_ReturnsError() {
        // Arrange
        var data = new UpdateStageData {
            Description = "",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("When set, the stage description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithWhitespaceDescription_ReturnsError() {
        // Arrange
        var data = new UpdateStageData {
            Description = "   ",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Message.Should().Be("When set, the stage description cannot be null or empty.");
    }

    [Fact]
    public void Validate_WithBothInvalid_ReturnsMultipleErrors() {
        // Arrange
        var data = new UpdateStageData {
            Name = "",
            Description = "",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(2);
    }

    [Fact]
    public void Validate_WithPublishedButNotPublic_ReturnsError() {
        // Arrange
        var data = new UpdateStageData {
            IsPublished = true,
            IsPublic = false,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().HaveCount(2);
    }

    [Fact]
    public void Validate_WithPublishedAndPublic_ReturnsSuccess() {
        // Arrange
        var data = new UpdateStageData {
            IsPublished = true,
            IsPublic = true,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var data = new UpdateStageData();

        // Assert
        data.Name.IsSet.Should().BeFalse();
        data.Description.IsSet.Should().BeFalse();
        data.IsPublished.IsSet.Should().BeFalse();
        data.IsPublic.IsSet.Should().BeFalse();
        data.Settings.IsSet.Should().BeFalse();
        data.Grid.IsSet.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange & Act
        var data = new UpdateStageData {
            Name = "Updated Name",
            Description = "Updated Description",
            IsPublished = true,
            IsPublic = true,
        };

        // Assert
        data.Name.IsSet.Should().BeTrue();
        data.Name.Value.Should().Be("Updated Name");
        data.Description.IsSet.Should().BeTrue();
        data.Description.Value.Should().Be("Updated Description");
        data.IsPublished.IsSet.Should().BeTrue();
        data.IsPublished.Value.Should().BeTrue();
        data.IsPublic.IsSet.Should().BeTrue();
        data.IsPublic.Value.Should().BeTrue();
    }

    [Fact]
    public void SettingsUpdate_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var mainBackgroundId = Guid.CreateVersion7();
        var alternateBackgroundId = Guid.CreateVersion7();
        var ambientSoundId = Guid.CreateVersion7();
        var panning = new Point(10, 20);

        // Act
        var settings = new UpdateStageData.SettingsUpdate {
            MainBackgroundId = mainBackgroundId,
            AlternateBackgroundId = alternateBackgroundId,
            AmbientSoundId = ambientSoundId,
            AmbientSoundVolume = 0.75f,
            AmbientSoundLoop = false,
            AmbientSoundIsPlaying = true,
            ZoomLevel = 1.5f,
            Panning = panning,
            AmbientLight = AmbientLight.Daylight,
            Weather = Weather.Rain,
        };

        // Assert
        settings.MainBackgroundId.IsSet.Should().BeTrue();
        settings.MainBackgroundId.Value.Should().Be(mainBackgroundId);
        settings.AlternateBackgroundId.IsSet.Should().BeTrue();
        settings.AlternateBackgroundId.Value.Should().Be(alternateBackgroundId);
        settings.AmbientSoundId.IsSet.Should().BeTrue();
        settings.AmbientSoundId.Value.Should().Be(ambientSoundId);
        settings.AmbientSoundVolume.IsSet.Should().BeTrue();
        settings.AmbientSoundVolume.Value.Should().Be(0.75f);
        settings.AmbientSoundLoop.IsSet.Should().BeTrue();
        settings.AmbientSoundLoop.Value.Should().BeFalse();
        settings.AmbientSoundIsPlaying.IsSet.Should().BeTrue();
        settings.AmbientSoundIsPlaying.Value.Should().BeTrue();
        settings.ZoomLevel.IsSet.Should().BeTrue();
        settings.ZoomLevel.Value.Should().Be(1.5f);
        settings.Panning.IsSet.Should().BeTrue();
        settings.Panning.Value.Should().Be(panning);
        settings.AmbientLight.IsSet.Should().BeTrue();
        settings.AmbientLight.Value.Should().Be(AmbientLight.Daylight);
        settings.Weather.IsSet.Should().BeTrue();
        settings.Weather.Value.Should().Be(Weather.Rain);
    }

    [Fact]
    public void GridUpdate_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var cellSize = new CellSize(64, 64);
        var offset = new Offset(5, 5);

        // Act
        var grid = new UpdateStageData.GridUpdate {
            Type = GridType.HexV,
            CellSize = cellSize,
            Offset = offset,
            Scale = 2.0,
        };

        // Assert
        grid.Type.IsSet.Should().BeTrue();
        grid.Type.Value.Should().Be(GridType.HexV);
        grid.CellSize.IsSet.Should().BeTrue();
        grid.CellSize.Value.Should().Be(cellSize);
        grid.Offset.IsSet.Should().BeTrue();
        grid.Offset.Value.Should().Be(offset);
        grid.Scale.IsSet.Should().BeTrue();
        grid.Scale.Value.Should().Be(2.0);
    }
}
