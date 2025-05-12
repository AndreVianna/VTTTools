namespace VttTools.WebApp.Pages.Game.Chat.Models;

public record ChatMessage(ChatMessageDirection Direction, string Text) {
    public DateTime Timestamp { get; } = DateTime.UtcNow;
}