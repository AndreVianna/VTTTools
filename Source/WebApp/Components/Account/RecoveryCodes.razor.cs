namespace VttTools.WebApp.Components.Account;

public partial class RecoveryCodes {
    [Parameter]
    public string[] Codes { get; set; } = [];

    [Parameter]
    public string? StatusMessage { get; set; }
}