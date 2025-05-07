namespace VttTools.WebApp.Pages.Assets;

internal class AssetsPageState {
    internal List<Asset> Assets { get; set; } = [];

    internal AssetsInputModel Input { get; set; } = new();
}