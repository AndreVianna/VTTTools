namespace VttTools.WebApp.Common.Services;

public class NavigationService(NavigationManager navigationManager) : INavigationService {
    private readonly NavigationManager _navigationManager = navigationManager;

    public string GetLogoutUri() => _navigationManager.GetRelativeUrl("account/logout");
    public string GetLoginUri() => _navigationManager.GetRelativeUrl("account/login");
    public string GetProfileUri() => _navigationManager.GetRelativeUrl("account/manage");
    public string GetRegisterUri() => _navigationManager.GetRelativeUrl("account/manage");
    public string GetAdventuresUri() => _navigationManager.GetRelativeUrl("/adventures");

    public bool IsSceneBuilderPage(string? currentLocation)
        => currentLocation?.StartsWith("scenes/builder/", StringComparison.OrdinalIgnoreCase) == true;
}