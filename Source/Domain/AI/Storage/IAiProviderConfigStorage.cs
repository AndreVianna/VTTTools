namespace VttTools.AI.Storage;

public interface IAiProviderConfigStorage {
    Task<IReadOnlyList<AiProvider>> GetAllProvidersAsync(CancellationToken ct = default);

    Task<AiProvider?> GetProviderByNameAsync(string provider, CancellationToken ct = default);

    Task<IReadOnlyList<AiProviderModel>> GetModelsByProviderAsync(Guid providerId, CancellationToken ct = default);

    Task<AiProviderModel?> GetDefaultModelAsync(Model.GeneratedContentType category, CancellationToken ct = default);

    Task<AiProviderModel?> GetModelByIdAsync(Guid id, CancellationToken ct = default);

    Task<AiProvider> AddProviderAsync(AiProvider config, CancellationToken ct = default);

    Task<AiProvider> UpdateProviderAsync(AiProvider config, CancellationToken ct = default);

    Task<AiProviderModel> AddModelAsync(AiProviderModel model, CancellationToken ct = default);

    Task<AiProviderModel> UpdateModelAsync(AiProviderModel model, CancellationToken ct = default);

    Task SetDefaultModelAsync(Guid modelId, CancellationToken ct = default);

    Task DeleteProviderAsync(Guid id, CancellationToken ct = default);

    Task DeleteModelAsync(Guid id, CancellationToken ct = default);
}
