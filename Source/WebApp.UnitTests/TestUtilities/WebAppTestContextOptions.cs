using System.Diagnostics.CodeAnalysis;

namespace VttTools.WebApp.TestUtilities;

public class WebAppTestContextOptions {
    public static readonly User DefaultUser = new() {
        Name = "Name",
        DisplayName = "Display Name",
        UserName = "test.user@host.com",
        NormalizedUserName = "TEST.USER@HOST.COM",
        Email = "test.user@host.com",
        NormalizedEmail = "TEST.USER@HOST.COM",
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
    public bool IsAdministrator { get; set; }

    public void UseAnonymousUser()
        => CurrentUser = null;

    [MemberNotNull(nameof(CurrentUser))]
    public void SetCurrentUser(User user, bool isAdministrator = false) {
        CurrentUser = new() {
            Id = user.Id,
            Name = user.Name,
            DisplayName = user.DisplayName,
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            Email = user.Email,
            NormalizedEmail = user.NormalizedEmail,
            EmailConfirmed = user.EmailConfirmed,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            PasswordHash = user.PasswordHash,
            TwoFactorEnabled = user.TwoFactorEnabled,
            LockoutEnabled = user.LockoutEnabled,
            ConcurrencyStamp = user.ConcurrencyStamp,
            SecurityStamp = user.SecurityStamp,
        };
        IsAdministrator = isAdministrator;
    }

    [MemberNotNull(nameof(CurrentUser))]
    public void UseDefaultUser(bool isAdministrator = false)
        => SetCurrentUser(DefaultUser, isAdministrator);

    [MemberNotNull(nameof(CurrentUser))]
    public void SetCurrentUser(Action<User> setup, bool isAdministrator = false) {
        UseDefaultUser(isAdministrator);
        setup(CurrentUser);
    }
}