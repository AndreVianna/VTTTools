namespace VttTools.WebApp.Pages;

internal class ErrorPageState {
    internal string? RequestId { get; set; }
    internal bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}