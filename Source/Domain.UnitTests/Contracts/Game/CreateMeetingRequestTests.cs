namespace VttTools.Contracts.Game;

public class CreateMeetingRequestTests {
    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new CreateMeetingRequest {
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
        var request = new CreateMeetingRequest {
            Subject = "Test Meeting",
            EpisodeId = Guid.NewGuid(),
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
    public void Validate_WithEmptySubject_ReturnsError(string? subject) {
        // Arrange
        var request = new CreateMeetingRequest {
            Subject = subject!,
        };

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message == "Meeting subject cannot be null or empty." && e.Sources.Contains(nameof(request.Subject)));
    }
}