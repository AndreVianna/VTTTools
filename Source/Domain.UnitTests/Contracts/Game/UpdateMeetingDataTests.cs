namespace VttTools.Contracts.Game;

public class UpdateMeetingDataTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateMeetingData {
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
        data.Subject.Value.Should().Be(name);
        data.EpisodeId.Value.Should().Be(episodeId);
    }

    [Fact]
    public void Validate_WithValidData_ReturnsSuccess() {
        // Arrange
        var data = new UpdateMeetingData {
            Subject = "Updated Meeting Subject",
        };

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Validate_OptionalValuesNotSet_ReturnsSuccess() {
        // Arrange
        var data = new UpdateMeetingData();

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }
}