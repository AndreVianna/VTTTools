namespace VttTools.WebApp.Components.Game.Pages;

public partial class Error {
    internal class PageState {
        internal string? RequestId { get; set; }
        internal bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}