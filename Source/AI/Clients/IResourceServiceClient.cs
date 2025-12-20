namespace VttTools.AI.Clients;

public interface IResourceServiceClient {
    Task<Guid?> UploadImageAsync(
        Guid ownerId,
        byte[] imageData,
        string fileName,
        string contentType,
        ResourceType resourceType,
        ResourceClassification? classification = null,
        string? description = null,
        CancellationToken ct = default);
}