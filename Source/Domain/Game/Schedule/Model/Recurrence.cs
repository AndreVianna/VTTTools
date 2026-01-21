namespace VttTools.Game.Schedule.Model;

public record Recurrence {
    public Frequency Frequency { get; init; } = Frequency.Once;
    public int Interval { get; init; } = 1;
    public int[] Days { get; init; } = [];
    public bool UseWeekdays { get; init; }
    public int Count { get; init; } = 1;
    public DateTimeOffset? Until { get; init; }
};