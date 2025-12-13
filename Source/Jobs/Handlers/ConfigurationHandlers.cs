using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Jobs.Handlers;

internal static class ConfigurationHandlers {
    internal static IResult GetInternalConfigurationHandler(
        [FromServices] InternalConfigurationService configService) {
        var entries = configService.GetConfigurationEntries();
        return Results.Ok(new {
            ServiceName = "Jobs",
            Entries = entries,
        });
    }
}
