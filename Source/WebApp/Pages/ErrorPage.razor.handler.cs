namespace VttTools.WebApp.Pages;

public sealed class ErrorPageHandler(IPublicPage page)
    : PublicPageHandler<ErrorPageHandler>(page) {
    internal ErrorPageState State { get; } = new();

    public override bool Configure() {
        if (!base.Configure())
            return false;
        State.RequestId = Activity.Current?.Id ?? Page.HttpContext?.TraceIdentifier;
        return true;
    }
}