namespace VttTools.WebApp.Pages;

public sealed class ErrorPageHandler(ErrorPage page)
    : PublicPageHandler<ErrorPageHandler, ErrorPage>(page) {
    public override bool Configure() {
        if (!base.Configure())
            return false;
        Page.State.RequestId = Activity.Current?.Id ?? Page.HttpContext?.TraceIdentifier;
        return true;
    }
}