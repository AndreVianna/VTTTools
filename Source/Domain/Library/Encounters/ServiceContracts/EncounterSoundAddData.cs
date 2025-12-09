
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterSoundAddData
    : Data {
    public string? Name { get; init; }
    public required Point Position { get; init; }
    public float Range { get; init; }
    public bool IsPlaying { get; init; }
    public bool Loop { get; init; }

    public Guid? ResourceId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Range <= 0)
            result += new Error("Open range must be greater than 0.", nameof(Range));
        return result;
    }
}