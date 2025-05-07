namespace VttTools.Library.Adventures.ApiContracts;

public record AddClonedSceneRequest
    : CloneTemplateRequest<Scene> {
    public Guid Id { get; init; }
}