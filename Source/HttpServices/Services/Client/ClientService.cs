namespace HttpServices.Services.Client;

internal sealed class ClientService<TDatabase>(TDatabase data,
                                               ILogger<ClientService<TDatabase>> logger)
    : IClientService
    where TDatabase : DbContext {
    public async Task<Result<RegisterClientResponse>> RegisterAsync(RegisterClientRequest request) {
        logger.LogInformation("Register new client requested.");
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.Errors;

        var secret = StringHelpers.GenerateSecret(_secretSize);

        var client = new Abstractions.Model.Client {
            Name = request.Name,
            HashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
        };
        await data.Set<Abstractions.Model.Client>().AddAsync(client);

        logger.LogInformation("NamedUser created a new account with password.");
        return new RegisterClientResponse {
            ClientId = client.Id,
            ClientSecret = secret,
        };
    }

    private const int _secretSize = 128;
}
