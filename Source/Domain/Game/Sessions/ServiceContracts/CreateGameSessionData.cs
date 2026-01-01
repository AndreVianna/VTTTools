namespace VttTools.Game.Sessions.ServiceContracts;

public record CreateGameSessionData
    : Data {
    public string Title { get; init; } = string.Empty;
    public Guid EncounterId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Title))
            result += new Error("Game session title cannot be null or empty.", nameof(Title));
        return result;
    }
}