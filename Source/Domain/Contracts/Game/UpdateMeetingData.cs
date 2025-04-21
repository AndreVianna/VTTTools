namespace VttTools.Contracts.Game;

public record UpdateMeetingData
    : Data {
    /// <summary>
    /// New subject for the meeting. If not set, subject is unchanged.
    /// </summary>
    public Optional<string> Subject { get; init; }
    /// <summary>
    /// New episode for the meeting. If not set, episode is unchanged.
    /// </summary>
    public Optional<Guid> EpisodeId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Subject.IsSet && string.IsNullOrWhiteSpace(Subject.Value))
            result += new Error("Meeting subject cannot be null or empty.", nameof(Subject));
        return result;
    }
}