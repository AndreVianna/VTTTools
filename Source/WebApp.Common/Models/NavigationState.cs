namespace VttTools.WebApp.Common.Models;

public class NavigationState {
    public string LogoutUri { get; set; } = string.Empty;
    public string LoginUri { get; set; } = string.Empty;
    public string ProfileUri { get; set; } = string.Empty;
    public string RegisterUri { get; set; } = string.Empty;
    public string AdventuresUri { get; set; } = string.Empty;

    public string CurrentLocation { get; set; } = string.Empty;
    public bool IsSceneBuilderPage { get; set; }
    public string ZoomLevelDisplay { get; set; } = "100%";

    public LoggedUser? User { get; set; }
}