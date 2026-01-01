using AiProvider = VttTools.AI.Model.AiProvider;
using AiProviderModel = VttTools.AI.Model.AiProviderModel;

namespace VttTools.Data.AI;

public class ProviderStorage(ApplicationDbContext context)
    : IAiProviderConfigStorage {

    public async Task<IReadOnlyList<AiProvider>> GetAllProvidersAsync(CancellationToken ct = default) {
        var entities = await context.AiProviderConfigs
            .AsNoTracking()
            .ToListAsync(ct);
        return [.. entities.Select(e => e.ToModel()!)];
    }

    public async Task<AiProvider?> GetProviderByNameAsync(string provider, CancellationToken ct = default) {
        var entity = await context.AiProviderConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Name == provider, ct);
        return entity?.ToModel();
    }

    public async Task<IReadOnlyList<AiProviderModel>> GetModelsByProviderAsync(Guid providerId, CancellationToken ct = default) {
        var entities = await context.AiProviderModels
            .AsNoTracking()
            .Where(m => m.ProviderId == providerId)
            .ToListAsync(ct);
        return [.. entities.Select(e => e.ToModel()!)];
    }

    public async Task<AiProviderModel?> GetDefaultModelAsync(GeneratedContentType category, CancellationToken ct = default) {
        var entity = await context.AiProviderModels
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.ContentType == category && m.IsDefault, ct);
        return entity?.ToModel();
    }

    public async Task<AiProviderModel?> GetModelByIdAsync(Guid id, CancellationToken ct = default) {
        var entity = await context.AiProviderModels
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id, ct);
        return entity?.ToModel();
    }

    public async Task<AiProvider> AddProviderAsync(AiProvider config, CancellationToken ct = default) {
        var entity = config.ToEntity();
        await context.AiProviderConfigs.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        return config;
    }

    public async Task<AiProvider> UpdateProviderAsync(AiProvider config, CancellationToken ct = default) {
        var existing = await context.AiProviderConfigs
            .FirstOrDefaultAsync(p => p.Id == config.Id, ct)
            ?? throw new InvalidOperationException($"Provider config with ID {config.Id} not found.");

        existing.UpdateFrom(config);
        await context.SaveChangesAsync(ct);
        return config;
    }

    public async Task<AiProviderModel> AddModelAsync(AiProviderModel model, CancellationToken ct = default) {
        var entity = model.ToEntity();
        await context.AiProviderModels.AddAsync(entity, ct);
        await context.SaveChangesAsync(ct);
        return model;
    }

    public async Task<AiProviderModel> UpdateModelAsync(AiProviderModel model, CancellationToken ct = default) {
        var existing = await context.AiProviderModels
            .FirstOrDefaultAsync(m => m.Id == model.Id, ct)
            ?? throw new InvalidOperationException($"Provider model with ID {model.Id} not found.");

        existing.UpdateFrom(model);
        await context.SaveChangesAsync(ct);
        return model;
    }

    public async Task SetDefaultModelAsync(Guid modelId, CancellationToken ct = default) {
        var model = await context.AiProviderModels
            .FirstOrDefaultAsync(m => m.Id == modelId, ct)
            ?? throw new InvalidOperationException($"Provider model with ID {modelId} not found.");

        var existingDefaults = await context.AiProviderModels
            .Where(m => m.ContentType == model.ContentType && m.IsDefault && m.Id != modelId)
            .ToListAsync(ct);

        foreach (var existingDefault in existingDefaults)
            existingDefault.IsDefault = false;

        model.IsDefault = true;
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteProviderAsync(Guid id, CancellationToken ct = default) {
        var existing = await context.AiProviderConfigs
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (existing is not null) {
            context.AiProviderConfigs.Remove(existing);
            await context.SaveChangesAsync(ct);
        }
    }

    public async Task DeleteModelAsync(Guid id, CancellationToken ct = default) {
        var existing = await context.AiProviderModels
            .FirstOrDefaultAsync(m => m.Id == id, ct);

        if (existing is not null) {
            context.AiProviderModels.Remove(existing);
            await context.SaveChangesAsync(ct);
        }
    }
}
