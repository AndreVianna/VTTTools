namespace VttTools.WebApp.Server.Pages;

internal class ErrorPageState() {
    public ErrorPageState(string? requestId)
        : this() {
        RequestId = requestId;
    }

    public string? RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}