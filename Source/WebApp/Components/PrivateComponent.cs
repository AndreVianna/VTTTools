namespace VttTools.WebApp.Components;

public class PrivateComponent<THandler>
    : PublicComponent<THandler>
    where THandler : PublicComponentHandler<THandler> {
    protected override void SetHandler()
        => Handler = InstanceFactory.Create<THandler>(HttpContext, NavigationManager, CurrentUser, LoggerFactory);

#pragma warning disable CS8765 // In private components, User is never null.
    public override User CurrentUser { get; set; } = null!;
#pragma warning restore CS8765

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        if (IsAuthenticated)
            return;
        NavigationManager.GoToSignIn();
    }
}