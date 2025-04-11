namespace WebApi.Services;

public interface IUserManagementService {
    Task<Result<AddUserResponse>> AddUserAsync(AddUserRequest request);

    Task<Result<UserResponse>> FindUserAsync(string identifier);

    Task<Result> UpdateUserAsync(Guid userId, UpdateUserRequest request);

    Task RemoveUserAsync(Guid userId);

    Task AssignRoleAsync(Guid userId, AssignRoleRequest request);

    Task RemoveRoleAsync(Guid userId, string roleName);
}
