namespace VttTools.WebApp.Components;

public interface IPage
    : IComponent {
    IServiceScopeFactory ScopeFactory { get; }
    ILogger Logger { get; }
}