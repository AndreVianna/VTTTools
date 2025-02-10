namespace HttpServices.Services.Client;

internal interface IClientService {
    Task<Result<RegisterClientResponse>> RegisterAsync(RegisterClientRequest request);
    Task<Result<string?>> GenerateTokenAsync(GenerateTokenRequest request);
}
