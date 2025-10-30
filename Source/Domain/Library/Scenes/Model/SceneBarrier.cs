namespace VttTools.Library.Scenes.Model;

public record SceneBarrier {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid SceneId { get; init; }
    public Guid BarrierId { get; init; }
    public IReadOnlyList<Pole> Poles { get; init; } = [];
}