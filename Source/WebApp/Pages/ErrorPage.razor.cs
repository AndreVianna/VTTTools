namespace VttTools.WebApp.Pages;

public partial class ErrorPage {
    internal ErrorPageState State => Handler.State;

    protected override bool ConfigureComponent() {
        Handler.Configure();
        return base.ConfigureComponent();
    }
}