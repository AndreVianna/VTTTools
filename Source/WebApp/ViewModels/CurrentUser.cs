namespace VttTools.WebApp.ViewModels;

public class CurrentUser : User {
    public bool IsAuthenticated { get; set; }
    public bool IsAdministrator { get; set; }
    public bool HasPassword { get; set; }
}