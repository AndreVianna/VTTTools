namespace VttTools.Identity.Services;

public interface ISignInService {
    Task SignInAsync(Guid userId, bool isPersistent = false, CancellationToken ct = default);
    Task SignOutAsync(CancellationToken ct = default);
}
