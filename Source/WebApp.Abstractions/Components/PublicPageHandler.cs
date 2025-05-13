namespace VttTools.WebApp.Components;

public class PublicPageHandler<THandler, TPage>(TPage page)
    : PageHandler
    where THandler : PublicPageHandler<THandler, TPage>
    where TPage : IPublicPage {
    protected TPage Page => page;
}