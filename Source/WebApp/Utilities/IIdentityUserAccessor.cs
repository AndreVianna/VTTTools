namespace VttTools.WebApp.Utilities;

public interface IIdentityUserAccessor {
    Task<Result<User>> GetCurrentUserOrRedirectAsync();
}