using System.Text.Json.Serialization;

namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterOpeningAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;

    [MaxLength(512)]
    public string? Description { get; init; }

    [MaxLength(32)]
    public string Type { get; init; } = string.Empty;

    public uint WallIndex { get; init; }

    [JsonPropertyName("startPole")]
    public required PoleRequest StartPole { get; init; }

    [JsonPropertyName("endPole")]
    public required PoleRequest EndPole { get; init; }

    public OpeningVisibility Visibility { get; init; } = OpeningVisibility.Visible;
    public OpeningState State { get; init; } = OpeningState.Closed;
    public OpeningOpacity Opacity { get; init; } = OpeningOpacity.Opaque;

    [MaxLength(32)]
    public string? Material { get; init; }

    [MaxLength(16)]
    public string? Color { get; init; }
}

public record PoleRequest {
    [JsonPropertyName("x")]
    public double X { get; init; }

    [JsonPropertyName("y")]
    public double Y { get; init; }

    [JsonPropertyName("h")]
    public double H { get; init; }
}
