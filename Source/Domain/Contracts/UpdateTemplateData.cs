namespace VttTools.Contracts;

/// <summary>
/// Data to update an existing <typeparamref name="T"/> template.
/// </summary>
/// <typeparam name="T">the type of the template</typeparam>
public record UpdateTemplateData<T>
    : Data {
    /// <summary>
    /// New name for the <typeparamref name="T"/>. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New visibility setting for the <typeparamref name="T"/>. If not set, visibility is unchanged.
    /// </summary>
    public Optional<Visibility> Visibility { get; set; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error($"{typeof(T).Name} name cannot be null or empty.", nameof(Name));
        return result;
    }
}