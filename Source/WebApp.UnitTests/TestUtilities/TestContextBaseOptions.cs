namespace VttTools.WebApp.TestUtilities;

public class TestContextBaseOptions {
    public Uri? CurrentLocation { get; set; }
    public User? CurrentUser { get; set; }
    public bool EnsureAuthenticated { get; set; }
}
