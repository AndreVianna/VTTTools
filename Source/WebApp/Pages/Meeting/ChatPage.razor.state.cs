namespace VttTools.WebApp.Pages.Meeting;

public partial class ChatPage {
    internal class PageState {
        internal List<ChatMessage> Messages { get; init; } = [];
        internal string? NewMessage { get; set; }
    }
}