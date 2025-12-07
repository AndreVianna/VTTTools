using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class ProviderInfoHandlers {
    internal static Task<IResult> GetAllProvidersHandler(
        [FromServices] IAiProviderFactory factory) {
        var providers = new {
            image = factory.GetAvailableImageProviders().Select(p => p.ToString()),
            audio = factory.GetAvailableAudioProviders().Select(p => p.ToString()),
            video = factory.GetAvailableVideoProviders().Select(p => p.ToString()),
        };

        return Task.FromResult(Results.Ok(providers));
    }
}
