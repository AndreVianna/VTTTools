namespace WebApp.Pages;

public partial class Adventures {
    private bool _isEditing;
    private Input _editAdventure = new();
    private Guid _editingAdventureId;
    private Adventure[]? _adventures;
    private string _newName = string.Empty;
    private Visibility _newVisibility = Visibility.Hidden;

    [Inject]
    private GameServiceClient GameService { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    protected override async Task OnInitializedAsync() => await LoadAdventures();

    private async Task LoadAdventures() {
        _adventures = await GameService.GetAdventuresAsync();
        StateHasChanged();
    }

    private async Task CreateAdventure() {
        if (string.IsNullOrWhiteSpace(_newName))
            return;
        var request = new CreateAdventureRequest {
            Name = _newName,
            Visibility = _newVisibility
        };
        var created = await GameService.CreateAdventureAsync(request);
        if (created != null) {
            _newName = string.Empty;
            await LoadAdventures();
        }
    }

    private async Task DeleteAdventure(Guid id) {
        await GameService.DeleteAdventureAsync(id);
        await LoadAdventures();
    }

    private void StartEdit(Adventure adv) {
        _isEditing = true;
        _editingAdventureId = adv.Id;
        _editAdventure = new() {
            Name = adv.Name,
            Visibility = adv.Visibility
        };
    }

    private void CancelEdit() => _isEditing = false;

    private async Task SaveEdit() {
        var request = new UpdateAdventureRequest {
            Name = _editAdventure.Name,
            Visibility = _editAdventure.Visibility,
        };
        var result = await GameService.UpdateAdventureAsync(_editingAdventureId, request);
        if (result.IsSuccessful) {
            _isEditing = false;
            await LoadAdventures();
        }
    }

    private async Task CloneAdventure(Guid id) {
        var clone = await GameService.CloneAdventureAsync(id);
        if (clone != null) {
            await LoadAdventures();
        }
    }

    private sealed class Input {
        public string? Name { get; set; }
        public Visibility? Visibility { get; set; }
    }
}
