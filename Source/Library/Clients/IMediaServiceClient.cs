namespace VttTools.Library.Clients;

public interface IMediaServiceClient {
    Task<Result> DeleteResourceAsync(Guid resourceId, CancellationToken ct = default);
}
