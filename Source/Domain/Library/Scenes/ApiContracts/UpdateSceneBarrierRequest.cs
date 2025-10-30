namespace VttTools.Library.Scenes.ApiContracts;

public record UpdateSceneBarrierRequest {
    public Optional<List<Pole>> Poles { get; init; }
}