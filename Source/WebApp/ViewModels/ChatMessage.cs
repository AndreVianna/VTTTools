namespace VttTools.WebApp.ViewModels;

public record ChatMessage(ChatMessageDirection Direction, string Text) {
    public DateTime Timestamp { get; } = DateTime.UtcNow;
}