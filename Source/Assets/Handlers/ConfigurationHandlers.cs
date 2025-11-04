using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Assets.Handlers;

public static class ConfigurationHandlers {
    public static IResult GetInternalConfigurationHandler(
        InternalConfigurationService configService) {

        var entries = configService.GetConfigurationEntries();

        return Results.Ok(new {
            ServiceName = "Assets",
            Entries = entries
        });
    }
}
