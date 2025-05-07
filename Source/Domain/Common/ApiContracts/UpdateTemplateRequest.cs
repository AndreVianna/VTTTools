namespace VttTools.Common.ApiContracts;

/// <summary>
/// Request to update an existing <typeparamref name="T"/> template.
/// </summary>
/// <typeparam name="T">the type of the template</typeparam>
public record UpdateTemplateRequest<T>
    : Request {
    /// <summary>
    /// New name for the <typeparamref name="T"/>. If not set, name is unchanged.
    /// </summary>
    public Optional<string> Name { get; init; }

    /// <summary>
    /// New visibility setting for the <typeparamref name="T"/>. If not set, visibility is unchanged.
    /// </summary>
    public Optional<Visibility> Visibility { get; set; }
}