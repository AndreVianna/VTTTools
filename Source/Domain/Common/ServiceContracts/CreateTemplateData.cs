namespace VttTools.Common.ServiceContracts;

/// <summary>
/// Data to create a new <typeparamref name="T"/> template.
/// </summary>
/// <typeparam name="T">the type of the template</typeparam>
public record CreateTemplateData<T>
    : Data {
    /// <summary>
    /// The name for the new <typeparamref name="T"/>. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new <typeparamref name="T"/>. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error($"{typeof(T).Name} name cannot be empty.", nameof(Name));
        return result;
    }
}