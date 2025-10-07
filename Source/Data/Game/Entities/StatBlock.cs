namespace VttTools.Data.Game.Entities;

/// <summary>
/// EF Core entity for character/creature stat blocks (stub - full implementation in future phase)
/// </summary>
public class StatBlock {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // TODO: Add full stat block properties in future phase
}
