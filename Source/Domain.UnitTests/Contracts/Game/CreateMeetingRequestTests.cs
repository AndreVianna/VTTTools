namespace VttTools.Contracts.Game;

public class CreateMeetingRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateMeetingRequest {
            Name = "Name",
            EpisodeId = Guid.NewGuid(),
        };
        const string name = "Other Name";
        var episodeId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Name = name,
            EpisodeId = episodeId,
        };

        // Assert
        data.Name.Should().Be(name);
        data.EpisodeId.Should().Be(episodeId);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var request = new CreateMeetingRequest {
            Name = "Test Meeting",
            EpisodeId = Guid.NewGuid(),
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
            EpisodeId = Guid.NewGuid(),
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
            EpisodeId = Guid.Empty,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}