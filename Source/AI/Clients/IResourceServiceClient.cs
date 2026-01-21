namespace VttTools.AI.Clients;

public interface IResourceServiceClient {
    Task<Guid?> UploadImageAsync(
        Guid ownerId,
        byte[] imageData,
        string fileName,
        string contentType,
        ResourceRole role,
        CancellationToken ct = default);
}