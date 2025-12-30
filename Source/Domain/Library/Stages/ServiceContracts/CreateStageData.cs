namespace VttTools.Library.Stages.ServiceContracts;

public record CreateStageData : Data {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The stage name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The stage description cannot be null or empty.", nameof(Description));
        return result;
    }
}
