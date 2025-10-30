namespace VttTools.Library.Scenes.ServiceContracts;

public record PlaceSceneBarrierData {
    public Guid BarrierId { get; init; }
    public List<Pole> Poles { get; init; } = [];
}