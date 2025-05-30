namespace VttTools.Common.Model;

public record Participant {
    public Guid UserId { get; init; } = Guid.Empty;
    public bool IsRequired { get; init; }
    public PlayerType Type { get; init; }
}