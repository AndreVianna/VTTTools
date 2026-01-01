using UserEntity = VttTools.Data.Identity.Entities.User;

namespace VttTools.Auth.Services;

public class SignInService(
    UserManager<UserEntity> userManager,
    SignInManager<UserEntity> signInManager)
    : ISignInService {

    public async Task SignInAsync(Guid userId, bool isPersistent = false, CancellationToken ct = default) {
        var entity = await userManager.FindByIdAsync(userId.ToString());
        if (entity is not null)
            await signInManager.SignInAsync(entity, isPersistent);
    }

    public async Task SignOutAsync(CancellationToken ct = default)
        => await signInManager.SignOutAsync();
}
