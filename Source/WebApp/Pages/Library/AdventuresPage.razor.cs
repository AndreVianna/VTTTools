namespace VttTools.WebApp.Pages.Library;

public partial class AdventuresPage {
    [Inject]
    internal ILibraryClient LibraryClient { get; set; } = null!;

    internal AdventuresPageState State => Handler.State;
    internal AdventuresInputModel CreateInput => Handler.State.CreateInput;
    internal AdventuresInputModel EditInput => Handler.State.EditInput;

    protected override async Task<bool> ConfigureAsync() {
        await Handler.LoadAdventuresAsync(LibraryClient);
        return true;
    }

    internal Task CreateAdventure()
        => Handler.SaveCreatedAdventure();

    internal void ShowEditDialog(Adventure adv)
        => Handler.StartAdventureEditing(adv);

    internal void HideEditDialog()
        => Handler.EndAdventureEditing();

    internal Task SaveEdit()
        => Handler.SaveEditedAdventure();

    internal Task DeleteAdventure(Guid id)
        => Handler.DeleteAdventure(id);

    internal Task CloneAdventure(Guid id)
        => Handler.CloneAdventure(id);
}