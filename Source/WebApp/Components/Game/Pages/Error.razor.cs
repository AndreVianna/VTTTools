namespace VttTools.WebApp.Components.Game.Pages;

public partial class Error {
    [CascadingParameter]
    internal HttpContext? HttpContext { get; set; }

    internal PageState State { get; set; } = new();

    protected override void OnInitialized() {
        base.OnInitialized();
        Handler.Initialize(HttpContext, State);
    }
}