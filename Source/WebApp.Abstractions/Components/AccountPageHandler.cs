namespace VttTools.WebApp.Components;

public class AccountPageHandler<THandler, TPage>(TPage page)
    : PageHandler
    where THandler : AccountPageHandler<THandler, TPage>
    where TPage : IAccountPage {
    protected TPage Page => page;
}