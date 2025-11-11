namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterAssetUpdateRequest
    : Request {
    public Optional<string> Name { get; init; }

    public Optional<bool> IsVisible { get; set; }
    public Optional<bool> IsLocked { get; set; }

    public Optional<Frame> Frame { get; init; }
    public Optional<Guid?> TokenId { get; set; }
    public Optional<Guid?> PortraitId { get; set; }

    public Optional<Position> Position { get; init; }
    public Optional<NamedSize> Size { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }

    public Optional<Guid?> ControlledBy { get; set; }
    public Optional<string?> Notes { get; init; }
}