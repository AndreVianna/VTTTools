namespace VttTools.WebApp.Components;

public interface IPublicComponent
    : IComponent {
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    string? UserDisplayName { get; }
}