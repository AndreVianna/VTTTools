namespace VttTools.Game.Schedule.Model;

public class RecurrenceTests {
    [Fact]
    public void Constructor_WithDefaultValues_InitializesCorrectly() {
        // Arrange & Act
        var recurrence = new Recurrence();

        // Assert
        recurrence.Frequency.Should().Be(Frequency.Once);
        recurrence.Interval.Should().Be(1);
        recurrence.Days.Should().BeEmpty();
        recurrence.UseWeekdays.Should().BeFalse();
        recurrence.Count.Should().Be(1);
        recurrence.Until.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithCustomValues_InitializesCorrectly() {
        // Arrange
        var until = DateTimeOffset.Now.AddMonths(6);

        // Act
        var recurrence = new Recurrence {
            Frequency = Frequency.Weekly,
            Interval = 2,
            Days = [1, 3, 5],
            UseWeekdays = true,
            Count = 10,
            Until = until,
        };

        // Assert
        recurrence.Frequency.Should().Be(Frequency.Weekly);
        recurrence.Interval.Should().Be(2);
        recurrence.Days.Should().BeEquivalentTo([1, 3, 5]);
        recurrence.UseWeekdays.Should().BeTrue();
        recurrence.Count.Should().Be(10);
        recurrence.Until.Should().Be(until);
    }

    [Fact]
    public void WithClause_WithChangedFrequency_UpdatesProperty() {
        // Arrange
        var original = new Recurrence();

        // Act
        var updated = original with { Frequency = Frequency.Daily };

        // Assert
        updated.Frequency.Should().Be(Frequency.Daily);
        original.Frequency.Should().Be(Frequency.Once);
    }

    [Fact]
    public void WithClause_WithChangedInterval_UpdatesProperty() {
        // Arrange
        var original = new Recurrence();

        // Act
        var updated = original with { Interval = 3 };

        // Assert
        updated.Interval.Should().Be(3);
        original.Interval.Should().Be(1);
    }

    [Fact]
    public void WithClause_WithChangedDays_UpdatesProperty() {
        // Arrange
        var original = new Recurrence();

        // Act
        var updated = original with { Days = [2, 4, 6] };

        // Assert
        updated.Days.Should().BeEquivalentTo([2, 4, 6]);
        original.Days.Should().BeEmpty();
    }

    [Fact]
    public void WithClause_WithChangedUseWeekdays_UpdatesProperty() {
        // Arrange
        var original = new Recurrence();

        // Act
        var updated = original with { UseWeekdays = true };

        // Assert
        updated.UseWeekdays.Should().BeTrue();
        original.UseWeekdays.Should().BeFalse();
    }

    [Fact]
    public void WithClause_WithChangedCount_UpdatesProperty() {
        // Arrange
        var original = new Recurrence();

        // Act
        var updated = original with { Count = 5 };

        // Assert
        updated.Count.Should().Be(5);
        original.Count.Should().Be(1);
    }

    [Fact]
    public void WithClause_WithChangedUntil_UpdatesProperty() {
        // Arrange
        var original = new Recurrence();
        var until = DateTimeOffset.Now.AddMonths(3);

        // Act
        var updated = original with { Until = until };

        // Assert
        updated.Until.Should().Be(until);
        original.Until.Should().BeNull();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var until = DateTimeOffset.Now.AddMonths(6);
        var days = (int[])[1, 3, 5];
        var recurrence1 = new Recurrence {
            Frequency = Frequency.Weekly,
            Interval = 2,
            Days = days,
            UseWeekdays = true,
            Count = 10,
            Until = until,
        };
        var recurrence2 = new Recurrence {
            Frequency = Frequency.Weekly,
            Interval = 2,
            Days = days,
            UseWeekdays = true,
            Count = 10,
            Until = until,
        };

        // Act & Assert
        recurrence1.Should().Be(recurrence2);
        (recurrence1 == recurrence2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var recurrence1 = new Recurrence { Frequency = Frequency.Daily };
        var recurrence2 = new Recurrence { Frequency = Frequency.Weekly };

        // Act & Assert
        recurrence1.Should().NotBe(recurrence2);
        (recurrence1 != recurrence2).Should().BeTrue();
    }
}
