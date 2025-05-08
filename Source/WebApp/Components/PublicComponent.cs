namespace VttTools.WebApp.Components;

public class PublicComponent
    : Component
    , IPublicComponent {
    [CascadingParameter]
    public bool IsAuthenticated { get; private set; }
    public Guid? UserId { get; private set; }
    public string? UserDisplayName { get; private set; }
    public bool UserIsAdministrator { get; private set; }

    protected override bool Configure() {
        if (!base.Configure()) return false;
        IsAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false;
        UserId = GetUserIdOrDefault();
        UserDisplayName = GetUserDisplayNameOrDefault();
        UserIsAdministrator = HttpContext.User.IsInRole("Administrator");
        return true;
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

    protected override Task<bool> ConfigureAsync()
        => Task.FromResult(Configure());
}

public class PublicComponent<THandler>
    : PublicComponent
    where THandler : PageHandler<THandler> {
    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync()) return false;
        await SetHandlerAsync();
        return true;
    }

    [MemberNotNull(nameof(Handler))]
    protected async Task SetHandlerAsync() {
        if (Handler is not null)
            return;
        Handler = InstanceFactory.Create<THandler>(this);
        await Handler.ConfigureAsync();
    }

    protected THandler Handler { get; set; } = null!;
}
