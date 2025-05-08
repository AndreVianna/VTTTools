namespace VttTools.WebApp.Pages.Account.Manage;

public partial class EmailPage {
    internal EmailPageState State => Handler.State;
    internal ChangeEmailInputModel ChangeEmailInput => Handler.State.ChangeEmailInput
        ;
    internal VerifyEmailInputModel VerifyEmailInput => Handler.State.VerifyEmailInput;

    private Task SendEmailChangeConfirmationAsync()
        => Handler.SendEmailChangeConfirmationAsync();

    private Task SendEmailVerificationAsync()
        => Handler.SendEmailVerificationAsync();
}