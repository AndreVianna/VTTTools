namespace VttTools.Contracts.Game;

public class CreateMeetingRequestTests {
    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new CreateMeetingRequest {
            Name = "Test Meeting",
            EpisodeId = Guid.NewGuid()
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyName_ReturnsSuccess() {
        // Arrange
        var request = new CreateMeetingRequest {
            Name = string.Empty,
            EpisodeId = Guid.NewGuid()
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_WithEmptyEpisodeId_ReturnsSuccess() {
        // Arrange
        var request = new CreateMeetingRequest {
            Name = "Test Meeting",
            EpisodeId = Guid.Empty
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}