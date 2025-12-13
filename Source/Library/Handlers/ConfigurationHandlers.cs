using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

public static class ConfigurationHandlers {
    public static IResult GetInternalConfigurationHandler(InternalConfigurationService configService) {

        var entries = configService.GetConfigurationEntries();

        return Results.Ok(new {
            ServiceName = "Library",
            Entries = entries
        });
    }
}