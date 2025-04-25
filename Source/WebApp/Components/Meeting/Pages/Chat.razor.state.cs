namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Chat {
    internal class PageState {
        internal List<ChatMessage> Messages { get; init; } = [];
        internal string? NewMessage { get; set; }
    }
}