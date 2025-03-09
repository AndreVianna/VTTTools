namespace HttpServices.ApiConsumers.Contracts;

public sealed record RegisterClientResponse {
    public required string ApiConsumerId { get; init; }
    public required string ApiConsumerSecret { get; init; }
}