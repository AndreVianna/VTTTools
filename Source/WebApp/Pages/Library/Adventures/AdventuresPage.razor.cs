namespace VttTools.WebApp.Pages.Library.Adventures;

public partial class AdventuresPage {
    [Inject]
    internal ILibraryClient LibraryClient { get; set; } = null!;

    internal AdventuresPageState State => Handler.State;
    internal AdventureInputModel CreateInput => Handler.State.CreateInput;
    internal AdventureInputModel EditInput => Handler.State.EditInput;

    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        await Handler.LoadAdventuresAsync(LibraryClient);
        return true;
    }

    internal Task CreateAdventure()
        => Handler.SaveCreatedAdventure();

    internal Task ShowEditDialog(Guid advId)
        => Handler.StartAdventureEditing(advId);

    internal void HideEditDialog()
        => Handler.EndAdventureEditing();

    internal Task SaveEdit()
        => Handler.SaveEditedAdventure();

    internal Task DeleteAdventure(Guid id)
        => Handler.DeleteAdventure(id);

    internal Task CloneAdventure(Guid id)
        => Handler.CloneAdventure(id);
}