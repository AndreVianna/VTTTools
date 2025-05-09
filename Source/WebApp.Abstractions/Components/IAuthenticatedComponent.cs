namespace VttTools.WebApp.Components;

public interface IAuthenticatedComponent
    : IComponent {
    Guid UserId { get; }
    string UserDisplayName { get; }
}
