namespace VttTools.WebApp.Pages.Game.Chat;

internal class ChatPageState {
    internal List<ChatMessage> Messages { get; init; } = [];
    internal ChatPageInput Input { get; set; } = new();
}