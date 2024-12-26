namespace Domain.Contracts.GameToken;

public interface ITokenService {
    Task<Token> CreateTokenAsync(Guid sessionId, Guid mapId, string name, Stream imageStream, Position position, Size size, CancellationToken ct = default);
    Task<Token> UpdateTokenPositionAsync(Guid sessionId, Guid mapId, Guid tokenId, Position newPosition, CancellationToken ct = default);
    Task DeleteTokenAsync(Guid sessionId, Guid mapId, Guid tokenId, CancellationToken ct = default);
}
