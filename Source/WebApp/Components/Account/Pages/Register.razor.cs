using static HttpServices.Abstractions.UserAccountEndpoints;

namespace WebApp.Components.Account.Pages;

public partial class Register {
    private IEnumerable<IdentityError>? _identityErrors = [];

    [Inject]
    protected IHttpClientFactory ClientFactory { get; init; } = null!;

    [Inject]
    protected NavigationManager NavigationManager { get; init; } = null!;

    [Inject]
    protected IdentityRedirectManager RedirectManager { get; init; } = null!;

    [SupplyParameterFromForm]
    protected InputModel Input { get; set; } = new();

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    private string? Message => _identityErrors is null ? null : $"Error: {string.Join(", ", _identityErrors.Select(error => error.Description))}";

    public async Task RegisterUser(EditContext _) {
        var client = ClientFactory.CreateClient("IdentityService");
        var request = new RegisterUserRequest {
            Email = Input.Email,
            Name = Input.Name,
            Password = Input.Password,
            ConfirmationUrl = NavigationManager.ToAbsoluteUri("Account/ConfirmEmail").ToString(),
            ReturnUrl = ReturnUrl,
        };
        var response = await client.PostAsJsonAsync(FindUserByIdEndpoint, request);
        if (!response.IsSuccessStatusCode) {
            _identityErrors = [new() { Code = "REGISTER_001", Description = "Error!" }];
            return;
        }
        RedirectManager.RedirectTo(ReturnUrl);
    }

    protected sealed class InputModel {
        [Required]
        [MaxLength(256)]
        [Display(Name = "Name")]
        public string Name { get; set; } = "";

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 8)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; } = "";
    }
}
