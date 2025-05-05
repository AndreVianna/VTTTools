namespace VttTools.WebApp.Components;

public class AuthorizedComponent
    : ExtendedComponent {
    protected override async Task OnParametersSetAsync() {
        await base.OnParametersSetAsync();
        EnsureIsAuthorized();
    }

    private void EnsureIsAuthorized() {
        switch (CurrentUser.IsAuthenticated) {
            case true when CurrentUser.Id != Guid.Empty:
                return;
            case false:
                NavigationManager.GoToSigIn();
                return;
            default:
                HttpContext.SetStatusMessage("Error: Invalid user information.");
                NavigationManager.ReplaceWith("account/invalid_user");
                break;
        }
    }
}

public class AuthorizedComponent<TComponent, THandler>
    : ExtendedComponent<TComponent, THandler>
    where TComponent : AuthorizedComponent<TComponent, THandler>
    where THandler : ComponentHandler<THandler, TComponent> {
    protected override async Task OnParametersSetAsync() {
        await base.OnParametersSetAsync();
        EnsureIsAuthorized();
    }

    private void EnsureIsAuthorized() {
        switch (CurrentUser.IsAuthenticated) {
            case true when CurrentUser.Id != Guid.Empty:
                return;
            case false:
                NavigationManager.GoToSigIn();
                return;
            default:
                HttpContext.SetStatusMessage("Error: Invalid user information.");
                NavigationManager.ReplaceWith("account/invalid_user");
                break;
        }
    }
}