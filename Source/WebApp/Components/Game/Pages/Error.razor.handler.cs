using System.Diagnostics;

namespace VttTools.WebApp.Components.Game.Pages;

public partial class Error {
    internal static class Handler {
        internal static void Initialize(HttpContext? httpContext, PageState state)
            => state.RequestId = Activity.Current?.Id ?? httpContext?.TraceIdentifier;
    }
}