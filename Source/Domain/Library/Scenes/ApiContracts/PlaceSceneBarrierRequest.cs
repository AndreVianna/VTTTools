namespace VttTools.Library.Scenes.ApiContracts;

public record PlaceSceneBarrierRequest {
    public Guid BarrierId { get; init; }
    public List<Pole> Poles { get; init; } = [];
}