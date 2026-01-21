using AiProvider = VttTools.AI.Model.AiProvider;
using AiProviderConfigEntity = VttTools.Data.AI.Entities.Provider;
using AiProviderModel = VttTools.AI.Model.AiProviderModel;
using AiProviderModelEntity = VttTools.Data.AI.Entities.AiModel;
using PromptTemplate = VttTools.AI.Model.PromptTemplate;
using PromptTemplateEntity = VttTools.Data.AI.Entities.PromptTemplate;

namespace VttTools.Data.AI;

internal static class Mapper {
    // PromptTemplate Mappers
    public static Expression<Func<PromptTemplateEntity, PromptTemplate>> AsTemplate = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            Category = entity.Category,
            Version = entity.Version,
            SystemPrompt = entity.SystemPrompt,
            UserPromptTemplate = entity.UserPromptTemplate,
            NegativePromptTemplate = entity.NegativePromptTemplate,
            ReferenceImage = entity.ReferenceImage != null ? entity.ReferenceImage.ToModel() : null,
        };

    internal static PromptTemplate? ToModel(this PromptTemplateEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Name = entity.Name,
            Category = entity.Category,
            Version = entity.Version,
            SystemPrompt = entity.SystemPrompt,
            UserPromptTemplate = entity.UserPromptTemplate,
            NegativePromptTemplate = entity.NegativePromptTemplate,
            ReferenceImage = entity.ReferenceImage?.ToModel(),
        };

    [return: NotNullIfNotNull(nameof(model))]
    internal static PromptTemplateEntity ToEntity(this PromptTemplate model)
        => new() {
            Id = model.Id,
            Name = model.Name,
            Category = model.Category,
            Version = model.Version,
            SystemPrompt = model.SystemPrompt,
            UserPromptTemplate = model.UserPromptTemplate,
            NegativePromptTemplate = model.NegativePromptTemplate,
            ReferenceImageId = model.ReferenceImage?.Id,
        };

    internal static void UpdateFrom(this PromptTemplateEntity entity, PromptTemplate model) {
        entity.Name = model.Name;
        entity.Category = model.Category;
        entity.Version = model.Version;
        entity.SystemPrompt = model.SystemPrompt;
        entity.UserPromptTemplate = model.UserPromptTemplate;
        entity.NegativePromptTemplate = model.NegativePromptTemplate;
        entity.ReferenceImageId = model.ReferenceImage?.Id;
    }

    // Provider Mappers
    public static Expression<Func<AiProviderConfigEntity, AiProvider>> AsProviderConfig = entity
        => new() {
            Id = entity.Id,
            Name = entity.Name,
            BaseUrl = entity.BaseUrl,
            HealthEndpoint = entity.HealthEndpoint,
            IsEnabled = entity.IsEnabled,
        };

    internal static AiProvider? ToModel(this AiProviderConfigEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Name = entity.Name,
            BaseUrl = entity.BaseUrl,
            HealthEndpoint = entity.HealthEndpoint,
            IsEnabled = entity.IsEnabled,
        };

    [return: NotNullIfNotNull(nameof(model))]
    internal static AiProviderConfigEntity ToEntity(this AiProvider model)
        => new() {
            Id = model.Id,
            Name = model.Name,
            BaseUrl = model.BaseUrl,
            HealthEndpoint = model.HealthEndpoint,
            IsEnabled = model.IsEnabled,
        };

    internal static void UpdateFrom(this AiProviderConfigEntity entity, AiProvider model) {
        entity.Name = model.Name;
        entity.BaseUrl = model.BaseUrl;
        entity.HealthEndpoint = model.HealthEndpoint;
        entity.IsEnabled = model.IsEnabled;
    }

    // AiModel Mappers
    public static Expression<Func<AiProviderModelEntity, AiProviderModel>> AsProviderModel = entity
        => new() {
            Id = entity.Id,
            ProviderId = entity.ProviderId,
            Category = entity.ContentType,
            ModelName = entity.Name,
            Endpoint = entity.Endpoint,
            IsDefault = entity.IsDefault,
            IsEnabled = entity.IsEnabled,
        };

    internal static AiProviderModel? ToModel(this AiProviderModelEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            ProviderId = entity.ProviderId,
            Category = entity.ContentType,
            ModelName = entity.Name,
            Endpoint = entity.Endpoint,
            IsDefault = entity.IsDefault,
            IsEnabled = entity.IsEnabled,
        };

    [return: NotNullIfNotNull(nameof(model))]
    internal static AiProviderModelEntity ToEntity(this AiProviderModel model)
        => new() {
            Id = model.Id,
            ProviderId = model.ProviderId,
            ContentType = model.Category,
            Name = model.ModelName,
            Endpoint = model.Endpoint,
            IsDefault = model.IsDefault,
            IsEnabled = model.IsEnabled,
        };

    internal static void UpdateFrom(this AiProviderModelEntity entity, AiProviderModel model) {
        entity.ProviderId = model.ProviderId;
        entity.ContentType = model.Category;
        entity.Name = model.ModelName;
        entity.Endpoint = model.Endpoint;
        entity.IsDefault = model.IsDefault;
        entity.IsEnabled = model.IsEnabled;
    }
}