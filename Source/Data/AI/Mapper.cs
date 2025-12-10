using PromptTemplate = VttTools.AI.Templates.Model.PromptTemplate;
using PromptTemplateEntity = VttTools.Data.AI.Entities.PromptTemplate;

namespace VttTools.Data.AI;

internal static class Mapper {
    internal static PromptTemplate? ToModel(this PromptTemplateEntity? entity)
        => entity == null ? null : new() {
            Id = entity.Id,
            Name = entity.Name,
            Category = entity.Category,
            Version = entity.Version,
            SystemPrompt = entity.SystemPrompt,
            UserPromptTemplate = entity.UserPromptTemplate,
            NegativePromptTemplate = entity.NegativePromptTemplate,
            ReferenceImageId = entity.ReferenceImageId,
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
            ReferenceImageId = model.ReferenceImageId,
        };

    internal static void UpdateFrom(this PromptTemplateEntity entity, PromptTemplate model) {
        entity.Name = model.Name;
        entity.Category = model.Category;
        entity.Version = model.Version;
        entity.SystemPrompt = model.SystemPrompt;
        entity.UserPromptTemplate = model.UserPromptTemplate;
        entity.NegativePromptTemplate = model.NegativePromptTemplate;
        entity.ReferenceImageId = model.ReferenceImageId;
    }
}
