namespace VttTools.WebApp.Components;

public class PrivateComponentHandler<THandler>(HttpContext httpContext, NavigationManager navigationManager, User user, ILoggerFactory? loggerFactory = null)
    : PublicComponentHandler<THandler>(httpContext, navigationManager, user, loggerFactory ?? NullLoggerFactory.Instance)
    where THandler : PublicComponentHandler<THandler> {
    protected override User CurrentUser { get; } = Ensure.IsNotNull(user);
}