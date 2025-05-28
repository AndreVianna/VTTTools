using VttTools.WebApp.Contracts.Game.Chat.Models;

namespace VttTools.WebApp.Server.Pages.Game.Chat;

internal class GameSessionChatPageState {
    internal List<ChatMessage> Messages { get; init; } = [];
    internal GameSessionChatInputModel Input { get; set; } = new();
}