using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.AI.Handlers;

internal static class ProviderInfoHandlers {
    internal static Task<IResult> GetAllProvidersHandler(
        [FromServices] IAiProviderFactory factory) {
        var providers = new {
            image = factory.GetAvailableImageProviders(),
            audio = factory.GetAvailableAudioProviders(),
            video = factory.GetAvailableVideoProviders(),
        };

        return Task.FromResult(Results.Ok(providers));
    }
}
