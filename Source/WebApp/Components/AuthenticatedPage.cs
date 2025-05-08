namespace VttTools.WebApp.Components;

public class AuthenticatedPage
    : Page, IAuthenticatedPage {
    [CascadingParameter]
    public string UserDisplayName { get; private set; } = null!;
    public Guid UserId { get; private set; }

    protected override bool Configure() {
        if (!base.Configure())
            return false;
        var user = HttpContext?.User;
        if (user is null) {
            GoToSignIn();
            return false;
        }
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        UserId = Guid.Parse(userId);
        UserDisplayName = GetUserDisplayName(user);
        return true;
    }

    private static string GetUserDisplayName(ClaimsPrincipal user)
        => user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value
        ?? user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
        ?? "User";
}

public class AuthenticatedPage<THandler>
    : AuthenticatedPage
    where THandler : AuthenticatedPageHandler<THandler> {
    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
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