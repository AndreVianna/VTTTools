namespace VttTools.WebApp.Contracts.Game.Sessions;

public sealed record GameSessionListItem {
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public GameSessionStatus Status { get; set; }
    public int PlayerCount { get; init; }
}