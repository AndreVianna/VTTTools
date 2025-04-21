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
}