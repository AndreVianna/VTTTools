namespace VttTools.Game.Schedule.Model;

public record Recurrence {
    // Unit of repetition;
    public Frequency Frequency { get; init; } = Frequency.Once;
    // Every N units;
    public int Interval { get; init; } = 1;
    // Values that depends on the Frequency, negative values are counted from the end of the interval.
    // The first value is always 0.
    public List<int> Days { get; init; } = [];
    // If true the value represents the day of the week (0 = Sunday, 6 = Saturday) for weekly recurrences
    // For non-negative values: (value % 7) = day of the week, (value / 7) = number of weeks
    // For non-negative values: (-(value + 1) % 7) = day of the week, (-(value + 1) / 7) = number of weeks
    public bool UseWeekdays { get; init; }
    // How many times to repeat
    public int Count { get; init; } = 1;
    // When to stop
    public DateTimeOffset? Until { get; init; }
};