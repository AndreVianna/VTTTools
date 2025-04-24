namespace VttTools.WebApp.Components.Game.Pages;

public partial class Assets {
    internal class PageState {
        internal Asset[]? Assets { get; set; }

        internal InputModel Input { get; set; } = new();
    }
}