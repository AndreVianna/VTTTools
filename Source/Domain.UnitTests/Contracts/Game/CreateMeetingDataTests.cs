namespace VttTools.Contracts.Game;

public class CreateMeetingDataTests {
    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateMeetingData {
            Name = "Test Meeting",
            EpisodeId = Guid.NewGuid()
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsSuccess() {
        // Arrange
        var data = new CreateMeetingData {
            Name = string.Empty,
            EpisodeId = Guid.NewGuid()
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyEpisodeId_ReturnsSuccess() {
        // Arrange
        var data = new CreateMeetingData {
            Name = "Test Meeting",
            EpisodeId = Guid.Empty
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}