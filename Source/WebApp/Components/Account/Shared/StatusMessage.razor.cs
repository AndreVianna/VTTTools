namespace VttTools.WebApp.Components.Account.Shared;

public partial class StatusMessage {
    private string? _messageFromCookie;

    [Parameter]
    public string? Message { get; set; }

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    private string? DisplayMessage => Message ?? _messageFromCookie;

    protected override void OnInitialized() {
        var statusCookieName = NavigationManager.GetStatusCookieName();
        _messageFromCookie = HttpContext.Request.Cookies[statusCookieName];

        if (_messageFromCookie is not null)
            HttpContext.Response.Cookies.Delete(statusCookieName);
    }
}