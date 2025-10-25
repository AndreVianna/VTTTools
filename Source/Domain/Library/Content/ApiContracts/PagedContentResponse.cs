namespace VttTools.Library.Content.ApiContracts;

public record PagedContentResponse {
    public ContentListItem[] Data { get; init; } = [];
    public Guid? NextCursor { get; init; }
    public bool HasMore { get; init; }
}