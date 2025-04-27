namespace VttTools.WebApp.Pages.Meeting;

internal class ChatPageState {
    internal List<ChatMessage> Messages { get; init; } = [];
    internal ChatPageInputModel Input { get; set; } = new();
}