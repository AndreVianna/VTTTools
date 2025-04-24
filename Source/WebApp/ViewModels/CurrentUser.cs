namespace VttTools.WebApp.ViewModels;

public class CurrentUser {
    public bool IsAuthenticated { get; set; }
    public Guid Id { get; set; } = Guid.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsAdministrator { get; set; }
}