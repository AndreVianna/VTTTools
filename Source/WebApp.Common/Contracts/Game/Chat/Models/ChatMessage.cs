namespace VttTools.WebApp.Contracts.Game.Chat.Models;

public record ChatMessage(ChatMessageDirection Direction, string Text) {
    public DateTime Timestamp { get; } = DateTime.UtcNow;
}