namespace VttTools.Library.Scenes.ApiContracts;

public record SceneAssetAddRequest {
    public string? Name { get; init; }
    public bool IsVisible { get; init; }

    public Frame Frame { get; init; } = new Frame();
    public Guid? TokenId { get; init; }
    public Guid? PortraitId { get; init; }

    public Position Position { get; init; } = Position.Zero;
    public NamedSize Size { get; init; } = NamedSize.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }
}