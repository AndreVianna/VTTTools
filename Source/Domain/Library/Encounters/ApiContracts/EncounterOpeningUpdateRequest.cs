namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterOpeningUpdateRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }

    [MaxLength(512)]
    public Optional<string?> Description { get; init; }

    [MaxLength(32)]
    public Optional<string> Type { get; init; }

    public Optional<double> Width { get; init; }
    public Optional<double> Height { get; init; }

    public Optional<OpeningVisibility> Visibility { get; init; }
    public Optional<OpeningState> State { get; init; }
    public Optional<OpeningOpacity> Opacity { get; init; }

    [MaxLength(32)]
    public Optional<string?> Material { get; init; }

    [MaxLength(16)]
    public Optional<string?> Color { get; init; }
}
