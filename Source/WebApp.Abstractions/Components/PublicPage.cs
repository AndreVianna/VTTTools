namespace VttTools.WebApp.Components;

public class PublicPage
    : Page, IPublicPage {
    public string? UserDisplayName { get; private set; }
    public Guid? UserId { get; private set; }
    public bool IsAuthenticated { get; private set; }

    protected override bool Configure() {
        if (!base.Configure())
            return false;
        IsAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false;
        UserDisplayName = GetUserDisplayNameOrDefault();
        UserId = GetUserIdOrDefault();
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

public class PublicPage<THandler>
    : PublicPage
    where THandler : PublicPageHandler<THandler> {
    protected override bool Configure() {
        SetHandler();
        return base.Configure();
    }
    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        await Handler.ConfigureAsync();
        return true;
    }

    [MemberNotNull(nameof(Handler))]
    protected void SetHandler() {
        if (Handler is not null)
            return;
        Handler = InstanceFactory.Create<THandler>(this);
    }

    protected THandler Handler { get; set; } = null!;
}