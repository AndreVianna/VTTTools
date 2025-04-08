namespace WebApp.Components.Account.Shared;

public partial class ExternalLoginPicker {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    protected IHttpClientFactory ClientFactory { get; init; } = null!;

    [Inject]
    protected IdentityRedirectManager RedirectManager { get; set; } = null!;

    private AuthenticationScheme[] _externalLogins = [];

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    private HttpClient _httpClient = null!;

    protected override async Task OnInitializedAsync() {
        _httpClient = ClientFactory.CreateClient("auth");
        var response = await _httpClient.GetAsync(SchemesEndpoint);
        response.EnsureSuccessStatusCode();
        var schemes = await response.Content.ReadFromJsonAsync<AuthenticationScheme[]>();
        //var schemes = await _httpClient.GetFromJsonAsync<AuthenticationScheme[]>(SchemesEndpoint);
        _externalLogins = [.. schemes!];
    }
}
