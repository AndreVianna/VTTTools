namespace VttTools.Library.Scenes.ServiceContracts;

public record UpdateSceneBarrierData {
    public Optional<List<Pole>> Poles { get; init; }
}