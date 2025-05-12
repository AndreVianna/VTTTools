namespace VttTools.WebApp.Components;

public interface IComponent {
    string? CurrentLocation { get; }
    HttpContext HttpContext { get; set; }
    bool IsReady { get; }
    NavigationManager NavigationManager { get; set; }
    Task StateHasChangedAsync();
}