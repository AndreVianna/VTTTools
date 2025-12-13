namespace VttTools.Game.Schedule.Model;

public class ScheduleTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var schedule = new Schedule();

        // Assert
        schedule.Id.Should().NotBeEmpty();
        schedule.OwnerId.Should().BeEmpty();
        schedule.Participants.Should().BeEmpty();
        schedule.EventId.Should().BeEmpty();
        schedule.Start.Should().Be(default);
        schedule.Duration.Should().Be(default);
        schedule.Recurrence.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var eventId = Guid.CreateVersion7();
        var start = DateTimeOffset.Now;
        var duration = TimeSpan.FromHours(2);
        var participants = new List<Participant> {
            new() { UserId = Guid.CreateVersion7(), Type = PlayerType.Player },
        };
        var recurrence = new Recurrence { Frequency = Frequency.Weekly };

        // Act
        var schedule = new Schedule {
            Id = id,
            OwnerId = ownerId,
            Participants = participants,
            EventId = eventId,
            Start = start,
            Duration = duration,
            Recurrence = recurrence,
        };

        // Assert
        schedule.Id.Should().Be(id);
        schedule.OwnerId.Should().Be(ownerId);
        schedule.Participants.Should().BeEquivalentTo(participants);
        schedule.EventId.Should().Be(eventId);
        schedule.Start.Should().Be(start);
        schedule.Duration.Should().Be(duration);
        schedule.Recurrence.Should().Be(recurrence);
    }

    [Fact]
    public void Id_WhenDefaultConstructor_GeneratesNewGuid() {
        // Arrange & Act
        var schedule1 = new Schedule();
        var schedule2 = new Schedule();

        // Assert
        schedule1.Id.Should().NotBeEmpty();
        schedule2.Id.Should().NotBeEmpty();
        schedule1.Id.Should().NotBe(schedule2.Id);
    }

    [Fact]
    public void WithClause_WithChangedOwnerId_UpdatesProperty() {
        // Arrange
        var original = new Schedule();
        var newOwnerId = Guid.CreateVersion7();

        // Act
        var updated = original with { OwnerId = newOwnerId };

        // Assert
        updated.OwnerId.Should().Be(newOwnerId);
        original.OwnerId.Should().BeEmpty();
    }

    [Fact]
    public void WithClause_WithChangedStart_UpdatesProperty() {
        // Arrange
        var original = new Schedule();
        var newStart = DateTimeOffset.Now;

        // Act
        var updated = original with { Start = newStart };

        // Assert
        updated.Start.Should().Be(newStart);
        original.Start.Should().Be(default);
    }

    [Fact]
    public void WithClause_WithChangedDuration_UpdatesProperty() {
        // Arrange
        var original = new Schedule();
        var newDuration = TimeSpan.FromHours(3);

        // Act
        var updated = original with { Duration = newDuration };

        // Assert
        updated.Duration.Should().Be(newDuration);
        original.Duration.Should().Be(default);
    }

    [Fact]
    public void WithClause_WithChangedRecurrence_UpdatesProperty() {
        // Arrange
        var original = new Schedule();
        var recurrence = new Recurrence { Frequency = Frequency.Monthly };

        // Act
        var updated = original with { Recurrence = recurrence };

        // Assert
        updated.Recurrence.Should().Be(recurrence);
        original.Recurrence.Should().BeNull();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var id = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var eventId = Guid.CreateVersion7();
        var start = DateTimeOffset.Now;
        var duration = TimeSpan.FromHours(2);
        var participants = new List<Participant> {
            new() { UserId = Guid.CreateVersion7(), Type = PlayerType.Player },
        };

        var schedule1 = new Schedule {
            Id = id,
            OwnerId = ownerId,
            Participants = participants,
            EventId = eventId,
            Start = start,
            Duration = duration,
        };
        var schedule2 = new Schedule {
            Id = id,
            OwnerId = ownerId,
            Participants = participants,
            EventId = eventId,
            Start = start,
            Duration = duration,
        };

        // Act & Assert
        schedule1.Should().Be(schedule2);
        (schedule1 == schedule2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var schedule1 = new Schedule { OwnerId = Guid.CreateVersion7() };
        var schedule2 = new Schedule { OwnerId = Guid.CreateVersion7() };

        // Act & Assert
        schedule1.Should().NotBe(schedule2);
        (schedule1 != schedule2).Should().BeTrue();
    }
}
