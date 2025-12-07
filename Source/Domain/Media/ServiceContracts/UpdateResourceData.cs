namespace VttTools.Media.ServiceContracts;

public record UpdateResourceData
    : Data {
    public Optional<string?> Description { get; init; }
    public Optional<Map<HashSet<string>>> Features { get; init; }
    public Optional<bool> IsPublic { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Description.IsSet && Description.Value is { Length: > 1024 })
            result += new Error("Description cannot exceed 1024 characters.", nameof(Description));
        if (Features.IsSet && Features.Value.Count > 50)
            result += new Error("Maximum 50 feature categories allowed.", nameof(Features));
        if (Features.IsSet) {
            foreach (var (key, values) in Features.Value) {
                if (key.Length > 32)
                    result += new Error($"Feature key '{key}' exceeds 32 characters.", nameof(Features));
                if (values.Count > 100)
                    result += new Error($"Feature '{key}' has too many values (max 100).", nameof(Features));
                foreach (var value in values) {
                    if (value.Length > 128)
                        result += new Error($"Feature value in '{key}' exceeds 128 characters.", nameof(Features));
                }
            }
        }
        return result;
    }
}