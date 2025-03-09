namespace HttpServices.ApiConsumers;

public interface IApiConsumerService {
    Task<Result<RegisterClientResponse>> RegisterAsync(RegisterClientRequest request);
    Task<Result<string?>> GenerateTokenAsync(GenerateTokenRequest request);
}
