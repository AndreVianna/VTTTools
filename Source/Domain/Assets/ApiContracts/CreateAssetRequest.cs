namespace VttTools.Assets.ApiContracts;

public record CreateAssetRequest
    : Request {
    public AssetKind Kind { get; init; }

    public required string Category {
        get;
        init => field = value.Trim();
    }

    public required string Type {
        get;
        init => field = value.Trim();
    }

    public string? Subtype {
        get;
        init => field = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public string Name {
        get;
        init => field = value.Trim();
    } = string.Empty;

    public string Description {
        get;
        init => field = value.Trim();
    } = string.Empty;

    public string[] Tags { get; init; } = [];

    public Guid? PortraitId { get; init; }
    public NamedSize TokenSize { get; init; } = NamedSize.Default;
    public Guid? TokenId { get; init; }
}