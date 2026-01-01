namespace VttTools.Game.Sessions.ServiceContracts;

public record UpdateGameSessionData
    : Data {
    public Optional<string> Title { get; init; }
    public Optional<Guid> EncounterId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Title.IsSet && string.IsNullOrWhiteSpace(Title.Value))
            result += new Error("Game session title cannot be null or empty.", nameof(Title));
        return result;
    }
}