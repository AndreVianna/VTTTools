using HttpServices.Contracts.SignIn;

using static HttpServices.AuthenticationEndpoints;

namespace WebApp.Components.Account.Pages;

public partial class Login {
    private static readonly JwtSecurityTokenHandler _jwtHandler = new();

    private string? _errorMessage;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    protected IHttpClientFactory ClientFactory { get; init; } = null!;

    [Inject]
    protected IdentityRedirectManager RedirectManager { get; init; } = null!;

    [Inject]
    protected ILogger<Login> Logger { get; init; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    private HttpClient _httpClient = null!;

    protected override Task OnInitializedAsync() {
        _httpClient = ClientFactory.CreateClient("auth");
        return !HttpMethods.IsGet(HttpContext.Request.Method)
                   ? Task.CompletedTask
                   : HttpContext.SignOutAsync();
    }

    public async Task LoginUser() {
        var request = new PasswordSignInRequest {
            Identifier = Input.Email,
            Password = Input.Password,
            RememberMe = Input.RememberMe,
            ReturnUrl = ReturnUrl,
        };
        var response = await _httpClient.PostAsJsonAsync(SignInEndpoint, request);
        if (!response.IsSuccessStatusCode) {
            _errorMessage = "Error: Invalid login attempt.";
            return;
        }
        var result = await response.Content.ReadFromJsonOrDefaultAsync<SignInResponse>();
        if (result is null) {
            Logger.LogWarning("SignInResponse is missing or is invalid.");
            _errorMessage = "Error: Invalid login attempt.";
            return;
        }
        if (result.RequiresConfirmation) {
            RedirectManager.RedirectTo("Account/ConfirmEmail");
            return;
        }
        if (result.RequiresTwoFactor) {
            RedirectManager.RedirectTo("Account/LoginWith2fa", new() {
                ["returnUrl"] = ReturnUrl,
                ["rememberMe"] = Input.RememberMe,
            });
            return;
        }

        var authToken = _jwtHandler.ReadJwtToken(result.Token);
        var claimsIdentity = new ClaimsIdentity(authToken.Claims, IdentityConstants.ExternalScheme);
        var authProperties = new AuthenticationProperties { IsPersistent = Input.RememberMe };
        await HttpContext.SignInAsync(new(claimsIdentity), authProperties);
        RedirectManager.RedirectTo(ReturnUrl);
    }

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; } = "";

        [Display(Name = "Remember me?")]
        public bool RememberMe { get; set; }
    }
}

public static class HttpContentExtensions {
    private static readonly JsonSerializerOptions _options = new() {
        PropertyNameCaseInsensitive = true
    };

    public static async Task<T?> ReadFromJsonOrDefaultAsync<T>(this HttpContent content)
        where T : class {
        var jsonString = await content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(jsonString)) {
            return null;
        }

        try {
            return JsonSerializer.Deserialize<T>(jsonString, _options);
        }
        catch (JsonException) {
            return null;
        }
    }
}
