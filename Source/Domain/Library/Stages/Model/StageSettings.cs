namespace VttTools.Library.Stages.Model;

public record StageSettings {
    public ResourceMetadata? MainBackground { get; init; }
    public ResourceMetadata? AlternateBackground { get; init; }
    public bool UseAlternateBackground { get; init; }
    public float ZoomLevel { get; init; } = 1;
    public Point Panning { get; init; } = Point.Zero;
    public AmbientLight AmbientLight { get; init; }
    public ResourceMetadata? AmbientSound { get; init; }
    public AmbientSoundSource AmbientSoundSource { get; init; } = AmbientSoundSource.NotSet;
    public float AmbientSoundVolume { get; set; } = 1.0f;
    public bool AmbientSoundLoop { get; set; } = true;
    public bool AmbientSoundIsPlaying { get; set; }
    public Weather Weather { get; init; }
}