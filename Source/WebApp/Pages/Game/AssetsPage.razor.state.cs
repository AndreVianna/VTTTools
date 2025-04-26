namespace VttTools.WebApp.Pages.Game;

public partial class AssetsPage {
    internal class PageState {
        internal List<Asset> Assets { get; set; } = [];

        internal InputModel Input { get; set; } = new();
    }
}