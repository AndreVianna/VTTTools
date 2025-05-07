namespace VttTools.WebApp.Pages.GameSessions;

internal class GameSessionChatPageState {
    internal List<ChatMessage> Messages { get; init; } = [];
    internal GameSessionChatInputModel Input { get; set; } = new();
}