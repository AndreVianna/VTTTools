namespace VttTools.WebApp.Components;

public class AuthenticatedPageHandler<THandler>(IAuthenticatedPage page)
    : PageHandler
    where THandler : AuthenticatedPageHandler<THandler> {
    protected IAuthenticatedPage Page => page;
}