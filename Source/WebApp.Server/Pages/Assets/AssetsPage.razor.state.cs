namespace VttTools.WebApp.Pages.Assets;

internal class AssetsPageState {
    internal List<AssetListItem> Assets { get; set; } = [];

    internal AssetsInputModel Input { get; set; } = new();
}