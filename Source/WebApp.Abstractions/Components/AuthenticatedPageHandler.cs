namespace VttTools.WebApp.Components;

public class AuthenticatedPageHandler<THandler, TPage>(TPage page)
    : PageHandler
    where THandler : AuthenticatedPageHandler<THandler, TPage>
    where TPage : IAuthenticatedPage {
    protected TPage Page => page;
}