namespace VttTools.WebApp.Pages;

public partial class ErrorPage {
    internal class PageState {
        internal string? RequestId { get; set; }
        internal bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}