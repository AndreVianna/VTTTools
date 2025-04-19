namespace VttTools.Contracts.Game;

public class CreateMeetingDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateMeetingData {
            Subject = "Subject",
            EpisodeId = Guid.NewGuid(),
        };
        const string name = "Other Subject";
        var episodeId = Guid.NewGuid();

        // Act
        // ReSharper disable once WithExpressionModifiesAllMembers
        var data = original with {
            Subject = name,
            EpisodeId = episodeId,
        };

        // Assert
        data.Subject.Should().Be(name);
        data.EpisodeId.Should().Be(episodeId);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new CreateMeetingData {
            Subject = "Test Meeting",
            EpisodeId = Guid.NewGuid(),
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
            Subject = string.Empty,
            EpisodeId = Guid.NewGuid(),
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
            Subject = "Test Meeting",
            EpisodeId = Guid.Empty,
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}