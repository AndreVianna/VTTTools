namespace HttpServices.Services.Client;

internal sealed class ClientService<TDatabase>(TDatabase data,
                                               ILogger<ClientService<TDatabase>> logger)
    : IClientService
    where TDatabase : DbContext {
    public async Task<Result<RegisterClientResponse>> RegisterAsync(RegisterClientRequest request, CancellationToken ct = default) {
        logger.LogInformation("New api client registration requested.");
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.Errors;

        var secret = StringHelpers.GenerateSecret(_secretSize);

        var client = new ApiClient {
            Name = request.Name,
        };
        await data.Set<ApiClient>().AddAsync(client, ct);
        await data.SaveChangesAsync(ct);

        logger.LogInformation("New api client registered.");

        return new RegisterClientResponse {
            ClientId = client.Id,
            ClientSecret = secret,
        };
    }

    private const int _secretSize = 128;
}
