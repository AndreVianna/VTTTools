namespace VttTools.WebApp.Components;

public class PublicPageHandler<THandler>(IPublicPage page)
    : PageHandler
    where THandler : PublicPageHandler<THandler> {
    protected IPublicPage Page => page;
}