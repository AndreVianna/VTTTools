namespace VttTools.Library.Stages.ApiContracts;

public record CreateStageRequest : Request {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}