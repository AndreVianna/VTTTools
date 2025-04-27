using System.Diagnostics.CodeAnalysis;

namespace VttTools.WebApp.TestUtilities;

public class WebAppTestContextOptions {
    public static readonly User DefaultUser = new() {
        Name = "Name",
        DisplayName = "Display Name",
        UserName = "TEST.USER@HOST.COM",
        NormalizedUserName = "TEST.USER@HOST.COM",
        Email = "test.user@host.com",
        NormalizedEmail = "test.user@host.com",
        EmailConfirmed = true,
        PhoneNumber = "212-555-1234",
        PhoneNumberConfirmed = true,
        PasswordHash = "[SomeFakePasswordHash]",
        TwoFactorEnabled = false,
        LockoutEnabled = true,
        ConcurrencyStamp = "d23847f6-5241-4656-85de-d3c3ee2d66b8",
        SecurityStamp = "f0d0bd5d-8e64-419c-a856-e0e6364d26a1",
    };

    public User? CurrentUser { get; set; }
    public string? CurrentUserRole { get; set; }
    public bool IsAuthenticated { get; set; }
    public bool IsAdministrator { get; set; }

    public void UseAnonymousUser() {
        IsAdministrator = false;
        IsAuthenticated = false;
        CurrentUser = null;
    }

    [MemberNotNull(nameof(CurrentUser))]
    public void UseDefaultUser() {
        IsAuthenticated = true;
        CurrentUser = DefaultUser;
    }

    [MemberNotNull(nameof(CurrentUser))]
    public void UseDefaultAdministrator() {
        IsAdministrator = true;
        IsAuthenticated = true;
        CurrentUser = DefaultUser;
    }

    [MemberNotNull(nameof(CurrentUser))]
    public void SetCurrentUser(User user, bool isAdministrator = false) {
        IsAdministrator = isAdministrator;
        IsAuthenticated = true;
        CurrentUser = Ensure.IsNotNull(user);
    }

    [MemberNotNull(nameof(CurrentUser))]
    public void SetCurrentUser(Action<User> setup, bool isAdministrator = false) {
        IsAdministrator = isAdministrator;
        IsAuthenticated = true;
        CurrentUser = DefaultUser;
        setup(CurrentUser);
    }
}