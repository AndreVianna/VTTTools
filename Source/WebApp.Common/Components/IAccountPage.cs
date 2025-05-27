namespace VttTools.WebApp.Components;

public interface IAccountPage
    : IPage {
    User AccountOwner { get; }
}