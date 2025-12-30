using Adventure = VttTools.Data.Library.Adventures.Entities.Adventure;
using Stage = VttTools.Data.Library.Stages.Entities.Stage;

namespace VttTools.Data.Library.Encounters.Entities;

public class Encounter {
    public Guid AdventureId { get; set; }
    public Adventure Adventure { get; set; } = null!;

    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }

    [MaxLength(128)]
    public string? Name { get; set; }
    [MaxLength(4096)]
    public string? Description { get; set; }
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }

    public Guid StageId { get; set; }
    public Stage Stage { get; set; } = null!;

    public ICollection<EncounterActor> Actors { get; set; } = [];
    public ICollection<EncounterObject> Objects { get; set; } = [];
    public ICollection<EncounterEffect> Effects { get; set; } = [];
}
