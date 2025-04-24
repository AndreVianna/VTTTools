namespace VttTools.Contracts;

/// <summary>
/// Request to update an existing <typeparamref name="T"/> template.
/// </summary>
/// <typeparam name="T">the type of the template</typeparam>
public record CloneTemplateRequest<T>
    : Request {
    /// <summary>
    /// New name for the <typeparamref name="T"/>. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }
}
