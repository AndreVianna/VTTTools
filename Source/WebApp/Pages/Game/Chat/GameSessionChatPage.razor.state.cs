using VttTools.WebApp.Pages.Game.Chat.Models;

namespace VttTools.WebApp.Pages.Game.Chat;

internal class GameSessionChatPageState {
    internal List<ChatMessage> Messages { get; init; } = [];
    internal GameSessionChatInputModel Input { get; set; } = new();
}