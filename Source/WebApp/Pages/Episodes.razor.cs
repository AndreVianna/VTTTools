namespace WebApp.Pages;

public partial class Episodes {
    [Parameter]
    public Guid AdventureId { get; set; }

    private Episode[]? _episodes;
    private string _newName = string.Empty;
    private Visibility _newVisibility = Visibility.Hidden;
    private bool _isEditing;
    private UpdateEpisodeRequest _editEpisode = new();
    private Guid _editingEpisodeId;

    [Inject]
    private GameServiceClient GameService { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    protected override async Task OnInitializedAsync() => await LoadEpisodes();

    private async Task LoadEpisodes() {
        _episodes = await GameService.GetEpisodesAsync(AdventureId);
        StateHasChanged();
    }

    private async Task CreateEpisode() {
        if (string.IsNullOrWhiteSpace(_newName))
            return;
        var request = new CreateEpisodeRequest {
            Name = _newName,
            Visibility = _newVisibility
        };
        var created = await GameService.CreateEpisodeAsync(AdventureId, request);
        if (created != null) {
            _newName = string.Empty;
            await LoadEpisodes();
        }
    }

    private void StartEdit(Episode ep) {
        _isEditing = true;
        _editingEpisodeId = ep.Id;
        _editEpisode = new UpdateEpisodeRequest {
            Name = ep.Name,
            Visibility = ep.Visibility
        };
    }

    private void CancelEdit() => _isEditing = false;

    private async Task SaveEdit() {
        var updated = await GameService.UpdateEpisodeAsync(_editingEpisodeId, _editEpisode);
        if (updated != null) {
            _isEditing = false;
            await LoadEpisodes();
        }
    }

    private async Task DeleteEpisode(Guid id) {
        await GameService.DeleteEpisodeAsync(id);
        await LoadEpisodes();
    }

    private async Task CloneEpisode(Guid id) {
        var clone = await GameService.CloneEpisodeAsync(id);
        if (clone != null) {
            await LoadEpisodes();
        }
    }
}
