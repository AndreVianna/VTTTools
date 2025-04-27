namespace VttTools.WebApp.Components.Account;

public partial class StatusMessageComponent {
    [Parameter]
    public string? Message { get; set; }

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    private string? DisplayMessage { get => Message ?? field; set; }

    protected override void OnInitialized()
        => DisplayMessage = HttpContext.GetStatusMessage();
}