namespace VttTools.WebApp.Server.Pages.Account.Manage;

public partial class EmailPage {
    internal virtual EmailPageState State { get; set; } = new();
    internal ChangeEmailPageInput ChangeEmailInput => State.ChangeEmailInput;
    internal VerifyEmailInputModel VerifyEmailInput => State.VerifyEmailInput;

    private Task SendEmailChangeConfirmationAsync()
        => Handler.SendEmailChangeConfirmationAsync();

    private Task SendEmailVerificationAsync()
        => Handler.SendEmailVerificationAsync();
}