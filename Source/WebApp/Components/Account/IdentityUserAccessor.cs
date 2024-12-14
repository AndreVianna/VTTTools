namespace WebApp.Components.Account;

internal sealed class IdentityUserAccessor(IHttpClientFactory clientFactory, IdentityRedirectManager redirectManager) {
    public async Task<ApplicationUser> GetRequiredUserAsync(HttpContext context) {
        var id = context.User.Identity?.Name;
        var user = await GetUserAsync(id);
        if (user is null)
            redirectManager.RedirectToWithStatus("Account/InvalidUser", $"Error: Unable to load user '{id ?? "[Unknown]"}'.", context);
        return user;
    }

    private static readonly CompositeFormat _uri = CompositeFormat.Parse("/users?id={0}");

    private async Task<ApplicationUser?> GetUserAsync(string? id) {
        var client = clientFactory.CreateClient("AuthService");
        return await client.GetFromJsonAsync<ApplicationUser>(string.Format(null, _uri, id));
    }
}
