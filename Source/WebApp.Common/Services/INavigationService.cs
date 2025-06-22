namespace VttTools.WebApp.Common.Services;

public interface INavigationService {
    string GetLogoutUri();
    string GetLoginUri();
    string GetProfileUri();
    string GetRegisterUri();
    string GetAdventuresUri();
    bool IsSceneBuilderPage(string? currentLocation);
}