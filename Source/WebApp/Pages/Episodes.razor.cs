namespace WebApp.Pages;

public partial class Episodes {
    [Parameter]
    public Guid AdventureId { get; set; }

    private Episode[]? _episodes;
    private bool _isEditing;
    //private UpdateEpisodeRequest _editEpisode = new();
    private Guid _editingEpisodeId;

    [Inject]
    private GameServiceClient GameService { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    private InputModel Input { get; set; } = new();

    protected override Task OnInitializedAsync() => LoadEpisodes();

    private async Task LoadEpisodes() {
        _episodes = await GameService.GetEpisodesAsync(AdventureId);
        StateHasChanged();
    }

    private async Task CreateEpisode() {
        var request = new CreateEpisodeRequest {
            Name = Input.Name,
            Visibility = Input.Visibility,
        };
        var result = await GameService.CreateEpisodeAsync(AdventureId, request);
        if (result.IsSuccessful) {
            Input = new();
            await LoadEpisodes();
        }
    }

    private void StartEdit(Episode ep) {
        _isEditing = true;
        _editingEpisodeId = ep.Id;
        Input = new() {
            Name = ep.Name,
            Visibility = ep.Visibility,
        };
    }

    private void CancelEdit() => _isEditing = false;

    private async Task SaveEdit() {
        var request = new UpdateEpisodeRequest {
            Name = Input.Name,
            Visibility = Input.Visibility,
        };
        var result = await GameService.UpdateEpisodeAsync(_editingEpisodeId, request);
        if (result.IsSuccessful) {
            _isEditing = false;
            await LoadEpisodes();
        }
    }

    private async Task DeleteEpisode(Guid id) {
        await GameService.DeleteEpisodeAsync(id);
        await LoadEpisodes();
    }

    private async Task CloneEpisode(Guid id) {
        var result = await GameService.CloneEpisodeAsync(id);
        if (result.IsSuccessful) {
            await LoadEpisodes();
        }
    }

    private sealed class InputModel {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; } = string.Empty;
        public Visibility Visibility { get; set; } = Visibility.Hidden;
    }
}
