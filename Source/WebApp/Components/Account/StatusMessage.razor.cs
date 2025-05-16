namespace VttTools.WebApp.Components.Account;

public partial class StatusMessage {
    [Parameter]
    public string? Message { get; set; }

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    private string? DisplayMessage { get; set; }

    protected override void OnParametersSet()
        => DisplayMessage = Message ?? HttpContext.GetStatusMessage();
}