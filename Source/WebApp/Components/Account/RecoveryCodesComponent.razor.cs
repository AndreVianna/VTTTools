namespace VttTools.WebApp.Components.Account;

public partial class RecoveryCodesComponent {
    [Parameter]
    public string[] RecoveryCodes { get; set; } = [];

    [Parameter]
    public string? StatusMessage { get; set; }
}