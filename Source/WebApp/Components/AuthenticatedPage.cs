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
            this.GoToSignIn();
            return false;
        }
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (string.IsNullOrEmpty(userId)) {
            this.GoToSignIn();
            return false;
        }
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