namespace VttTools.WebApp.Server.Pages.Account.Manage;

internal class EmailPageState {
    public ChangeEmailPageInput ChangeEmailInput { get; set; } = new();
    public VerifyEmailInputModel VerifyEmailInput { get; set; } = new();
}