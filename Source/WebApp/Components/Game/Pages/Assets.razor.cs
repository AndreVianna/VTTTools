namespace VttTools.WebApp.Components.Game.Pages;

public partial class Assets {
    private readonly Handler _handler = new();

    [Inject]
    internal GameServiceClient GameServiceClient { get; set; } = null!;

    internal PageState? State { get; set; }

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        State = await _handler.InitializeAsync(GameServiceClient);
    }

    internal Task CreateAsset()
        => _handler.CreateAssetAsync(State!);

    internal Task DeleteAsset(Guid id)
        => _handler.DeleteAssetAsync(State!, id);
}