namespace VttTools.WebApp.Components;

public class PublicComponent
    : Component
    , IPublicComponent {
    [CascadingParameter]
    public virtual bool IsAuthenticated { get; private set; }
    public virtual Guid? UserId { get; private set; }
    public virtual string? UserDisplayName { get; private set; }
    public virtual bool UserIsAdministrator { get; private set; }

    protected override void Configure() {
        base.Configure();
        IsAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false;
        UserId = GetUserIdOrDefault();
        UserDisplayName = GetUserDisplayNameOrDefault();
        UserIsAdministrator = HttpContext.User.IsInRole("Administrator");
    }

    private string? GetUserDisplayNameOrDefault()
        => IsAuthenticated
            ? HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value
                ?? HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
                ?? "User"
            : null;

    private Guid? GetUserIdOrDefault()
        => IsAuthenticated
        && Guid.TryParse(HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id
            : null;
}