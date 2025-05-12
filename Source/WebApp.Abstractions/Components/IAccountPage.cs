namespace VttTools.WebApp.Components;

public interface IAccountPage
    : IPage {
    User CurrentUser { get; }
}