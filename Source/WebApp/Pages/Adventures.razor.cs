using VttTools.WebApp.Services;

namespace VttTools.WebApp.Pages;

public partial class Adventures {
    private bool _isEditing;
    private Guid _editingAdventureId;
    private Adventure[]? _adventures;

    [Inject]
    private GameServiceClient GameService { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    private InputModel Input { get; set; } = new();

    protected override Task OnInitializedAsync() => LoadAdventures();

    private async Task LoadAdventures() {
        _adventures = await GameService.GetAdventuresAsync();
        StateHasChanged();
    }

    private async Task CreateAdventure() {
        var request = new CreateAdventureRequest {
            Name = Input.Name,
            Visibility = Input.Visibility,
        };
        var result = await GameService.CreateAdventureAsync(request);
        if (result.IsSuccessful) {
            Input = new();
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
        Input = new() {
            Name = adv.Name,
            Visibility = adv.Visibility,
        };
    }

    private void CancelEdit() => _isEditing = false;

    private async Task SaveEdit() {
        var request = new UpdateAdventureRequest {
            Name = Input.Name,
            Visibility = Input.Visibility,
        };
        var result = await GameService.UpdateAdventureAsync(_editingAdventureId, request);
        if (result.IsSuccessful) {
            _isEditing = false;
            await LoadAdventures();
        }
    }

    private async Task CloneAdventure(Guid id) {
        var result = await GameService.CloneAdventureAsync(id);
        if (result.IsSuccessful)
            await LoadAdventures();
    }

    private sealed class InputModel {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; } = string.Empty;
        public Visibility Visibility { get; set; } = Visibility.Hidden;
    }
}