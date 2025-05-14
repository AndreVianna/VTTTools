namespace VttTools.WebApp.Pages.Library.Adventures;

public class AdventureHandler(AdventurePage page)
    : PageHandler<AdventureHandler, AdventurePage>(page) {
    private ILibraryClient _client = null!;

    public async Task<bool> LoadAdventureAsync(ILibraryClient client) {
        _client = client;
        Page.State.Mode = Enum.Parse<DetailsPageMode>(Page.Action ?? "View", true);
        if (Page.State.Mode == DetailsPageMode.Create)
            return true;
        if (Page.Id == Guid.Empty)
            return false;
        var adventure = await client.GetAdventureByIdAsync(Page.Id);
        if (adventure == null)
            return false;

        Page.Input.Name = adventure.Name;
        Page.Input.Description = adventure.Description;
        Page.Input.Type = adventure.Type;
        Page.Input.ImagePath = adventure.ImagePath;
        Page.Input.IsVisible = adventure.IsVisible;
        Page.Input.IsPublic = adventure.IsPublic;

        if (Page.State.Mode == DetailsPageMode.Clone) {
            Page.Input.Name += " (Copy)";
            Page.Input.IsVisible = false;
            Page.Input.IsPublic = false;
        }

        Page.State.Original.Name = Page.Input.Name;
        Page.State.Original.Description = Page.Input.Description;
        Page.State.Original.Type = Page.Input.Type;
        Page.State.Original.ImagePath = Page.Input.ImagePath;
        Page.State.Original.IsVisible = Page.Input.IsVisible;
        Page.State.Original.IsPublic = Page.Input.IsPublic;
        return true;
    }

    internal Task SaveChangesAsync(bool continueEdit) {
        Page.State.Errors = [];
        return Page.State.Mode switch {
            DetailsPageMode.Create or DetailsPageMode.Clone => CreateAdventureAsync(continueEdit),
            DetailsPageMode.Edit => UpdateAdventureAsync(continueEdit),
            _ => Task.CompletedTask,
        };
    }

    public void DiscardChanges() {
        Page.Input.Name = Page.State.Original.Name;
        Page.Input.Description = Page.State.Original.Description;
        Page.Input.Type = Page.State.Original.Type;
        Page.Input.ImagePath = Page.State.Original.ImagePath;
        Page.Input.IsVisible = Page.State.Original.IsVisible;
        Page.Input.IsPublic = Page.State.Original.IsPublic;
        Page.State.Errors = [];
    }

    internal async Task DeleteAdventureAsync() {
        var deleted = await _client.DeleteAdventureAsync(Page.Id);
        if (deleted)
            Page.NavigationManager.NavigateTo("/adventures");
    }

    private async Task UpdateAdventureAsync(bool continueEdit) {
        var request = new UpdateAdventureRequest {
            Name = Page.Input.Name != Page.State.Original.Name ? Page.Input.Name : VttTools.Utilities.Optional<string>.None,
            Description = Page.Input.Description != Page.State.Original.Description ? Page.Input.Description : VttTools.Utilities.Optional<string>.None,
            Type = Page.Input.Type != Page.State.Original.Type ? Page.Input.Type : VttTools.Utilities.Optional<AdventureType>.None,
            IsVisible = Page.Input.IsVisible != Page.State.Original.IsVisible ? Page.Input.IsVisible : VttTools.Utilities.Optional<bool>.None,
            IsPublic = Page.Input.IsPublic != Page.State.Original.IsPublic ? Page.Input.IsPublic : VttTools.Utilities.Optional<bool>.None,
        };

        var result = await _client.UpdateAdventureAsync(Page.Id, request);
        if (!result.IsSuccessful) {
            Page.State.Errors = [.. result.Errors];
            return;
        }

        var url = continueEdit
            ? $"/adventure/edit/{Page.Id}"
            : !string.IsNullOrEmpty(Page.State.PendingNavigationUrl)
                ? Page.State.PendingNavigationUrl
                : $"/adventure/view/{Page.Id}";
        Page.NavigationManager.NavigateTo(url);
    }

    private async Task CreateAdventureAsync(bool continueEdit) {
        var request = new CreateAdventureRequest {
            Name = Page.Input.Name,
            Description = Page.Input.Description,
            Type = Page.Input.Type,
            ImagePath = Page.Input.ImagePath,
            IsVisible = Page.Input.IsVisible,
            IsPublic = Page.Input.IsPublic,
        };

        var result = await _client.CreateAdventureAsync(request);
        if (!result.IsSuccessful) {
            Page.State.Errors = [.. result.Errors];
            return;
        }

        var url = continueEdit
            ? $"/adventure/edit/{result.Value.Id}"
            : !string.IsNullOrEmpty(Page.State.PendingNavigationUrl)
                ? Page.State.PendingNavigationUrl
                : $"/adventure/view/{result.Value.Id}";
        Page.NavigationManager.NavigateTo(url);
    }
}
