namespace VttTools.Contracts.Game;

public record CreateMeetingRequest
    : Request {
    /// <summary>
    /// The subject of the new meeting.
    /// </summary>
    public string Subject { get; init; } = string.Empty;
    /// <summary>
    /// The initial Episode to activate when the meeting starts.
    /// </summary>
    [Required]
    public Guid EpisodeId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Subject))
            result += new Error("Meeting subject cannot be null or empty.", nameof(Subject));
        return result;
    }
}