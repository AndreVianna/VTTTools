﻿namespace WebApi.Services;

public class TenantManagementService(ITenantDataStore storage,
                                     IOptions<MultiTenantWebApiOptions> options,
                                     ITokenFactory tokenFactory,
                                     ILogger<TenantManagementService> logger)
    : ITenantManagementService {
    private const string _secretChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
    private readonly MultiTenantWebApiOptions _options = EnsureOptionsAreValid(options.Value);

    private static MultiTenantWebApiOptions EnsureOptionsAreValid(MultiTenantWebApiOptions options) {
        var result = options.Validate();
        if (!result.HasErrors)
            return options;
        var errorMessages = string.Join("", $"{Environment.NewLine} - ${result.Errors.Select(e => e.ToString())}");
        throw new InvalidOperationException($"Invalid TenantOptions configuration:{errorMessages}");
    }

    /// <inheritdoc />
    public async Task<Result<RegisterTenantResponse>> RegisterAsync(RegisterTenantRequest request) {
        logger.LogInformation("Tenant registration requested for name '{TenantName}'.", request.Name);
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult;

        var secret = GenerateSecret(_options.Secret.Size);
        var tenant = ToModel(request, HashSecret(secret));

        await storage.AddOrUpdateAsync(tenant);
        logger.LogInformation("Tenant registered successfully with ID '{TenantId}' for name '{TenantName}'.", tenant.Id, tenant.Name);

        return tenant.ToResponse(secret);
    }

    internal static Tenant ToModel(RegisterTenantRequest request, string hashedSecret)
        => new() {
            Name = request.Name,
            Secret = hashedSecret,
        };

    /// <inheritdoc />
    public async Task<Result<AccessTokenResponse?>> AuthenticateAsync(AuthenticateTenantRequest request) {
        logger.LogInformation("Tenant authentication requested for identifier '{TenantIdentifier}'.", request.Identifier);
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.WithNo<AccessTokenResponse?>();

        if (!TryDecodeTenantId(request.Identifier, out var id))
            return Result.Failure("Invalid credentials.");

        var tenant = await GetAuthenticatedTenantOrDefaultAsync(id, request.Secret);
        if (tenant is null)
            return Result.Failure("Invalid credentials.");

        var subject = new ClaimsIdentity([
            new(TenantClaimTypes.Identifier, Base64UrlEncoder.Encode(tenant.Id.ToByteArray())),
            new(ClaimTypes.Name, tenant.Name),
        ]);

        var accessToken = tokenFactory.CreateAccessToken(_options.TenantAccessToken, subject);

        await storage.AddAccessTokenAsync(tenant.Id, accessToken);

        logger.LogInformation("Tenant '{TenantId}' authenticated, tokens generated.", tenant.Id);
        return accessToken.ToResponse();
    }

    /// <inheritdoc />
    public async Task<Result<AccessTokenResponse?>> RefreshAccessTokenAsync(RefreshTenantAccessTokenRequest request) {
        logger.LogInformation("Refresh token request received.");
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult;

        var token = await storage.FindTokenByIdAsync(request.TokenId);
        if (token is null) {
            logger.LogWarning("Refresh token not found, expired, or already used.");
            return Result.Failure("Invalid or expired refresh token.");
        }

        var invalidated = await storage.InvalidateTokenAsync(request.TokenId);
        if (!invalidated) {
            logger.LogWarning("Failed to invalidate token '{TokenId}' after finding it.", request.TokenId);
            return Result.Failure("Failed to process the used refresh token.");
        }

        var tenant = await storage.FindByTokenIdAsync(request.TokenId);
        var subject = new ClaimsIdentity([
             new(_options.Claims.Identifier, Base64UrlEncoder.Encode(tenant!.Id.ToByteArray())),
             new(_options.Claims.Name, tenant.Name),
        ]);
        var newAccessToken = tokenFactory.CreateAccessToken(_options.TenantAccessToken, subject);

        await storage.AddAccessTokenAsync(tenant.Id, newAccessToken);
        await storage.RemoveAccessTokenAsync(request.TokenId);

        logger.LogInformation("Access token refreshed successfully for tenant '{TenantId}'. New refresh token issued.", tenant.Id);
        return newAccessToken.ToResponse();
    }

    protected virtual string GenerateSecret(ushort size)
        => RandomNumberGenerator.GetString(_secretChars, size);

    private static string HashSecret(string secret)
        => Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));

    private bool TryDecodeTenantId(string identifier, out Guid id) {
        id = Guid.Empty;
        try {
            var bytes = Base64UrlEncoder.DecodeBytes(identifier);
            if (bytes.Length != 16) {
                logger.LogWarning("Invalid tenant identifier format: '{Identifier}'.", identifier);
                return false;
            }
            id = new(bytes);
            return true;
        }
        catch (FormatException ex) {
            logger.LogWarning(ex, "Invalid tenant identifier decoding: '{Identifier}'.", identifier);
            return false;
        }
    }

    private async Task<Tenant?> GetAuthenticatedTenantOrDefaultAsync(Guid id, string secret) {
        var tenant = await storage.FindByIdAsync(id);
        if (tenant is null) {
            logger.LogWarning("Tenant '{TenantId}' not found during authentication attempt.", id);
            return null;
        }

        var hashedSecret = HashSecret(secret);

        if (hashedSecret != tenant.Secret) {
            logger.LogWarning("Invalid secret provided for tenant '{TenantId}'.", id);
            // Consider adding lockout logic here based on failed attempts
            return null;
        }

        // Potentially add checks: Is tenant active/enabled?
        // if (!tenant.IsActive) {
        //     logger.LogWarning("Authentication attempt for inactive tenant '{TenantId}'.", id);
        //     return null;
        // }

        return tenant;
    }
}
