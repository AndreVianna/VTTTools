namespace VttTools.WebApp.Components;

public class AccountPageHandler<THandler>(IAccountPage page)
    : PageHandler
    where THandler : AccountPageHandler<THandler> {
    protected IAccountPage Page => page;
}