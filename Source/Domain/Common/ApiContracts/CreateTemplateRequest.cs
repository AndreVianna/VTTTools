namespace VttTools.Common.ApiContracts;

/// <summary>
/// Request to create a new <typeparamref name="T"/> template.
/// </summary>
/// <typeparam name="T">the type of the template</typeparam>
public record CreateTemplateRequest<T>
    : Request {
    /// <summary>
    /// The name for the new <typeparamref name="T"/>. If not set, name is unchanged.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The visibility setting for the new <typeparamref name="T"/>. If not set, visibility is unchanged.
    /// </summary>
    public Visibility Visibility { get; set; }
}