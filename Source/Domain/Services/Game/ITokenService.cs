namespace VttTools.Services.Game;

public interface ITokenService {
    Task<SessionMapToken> CreateTokenAsync(Guid sessionId, Guid mapId, string name, Stream imageStream, Position position, Size size, CancellationToken ct = default);
    Task<SessionMapToken> UpdateTokenPositionAsync(Guid sessionId, Guid mapId, Guid tokenId, Position newPosition, CancellationToken ct = default);
    Task DeleteTokenAsync(Guid sessionId, Guid mapId, Guid tokenId, CancellationToken ct = default);
}
