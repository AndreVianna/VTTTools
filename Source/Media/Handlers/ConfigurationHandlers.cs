using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

public static class ConfigurationHandlers {
    public static IResult GetInternalConfigurationHandler(
        InternalConfigurationService configService) {

        var entries = configService.GetConfigurationEntries();

        return Results.Ok(new {
            ServiceName = "Media",
            Entries = entries
        });
    }
}
