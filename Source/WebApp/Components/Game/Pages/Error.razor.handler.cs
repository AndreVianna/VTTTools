using System.Diagnostics;

namespace VttTools.WebApp.Components.Game.Pages;

public partial class Error {
    internal sealed class Handler {
        internal PageState State { get; } = new();

        public static Handler Initialize(HttpContext? httpContext)
            => new() {
                State = {
                    RequestId = Activity.Current?.Id ?? httpContext?.TraceIdentifier
                },
            };
    }
}