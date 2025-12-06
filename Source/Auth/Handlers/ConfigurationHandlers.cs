using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Auth.Handlers;

public static class ConfigurationHandlers {
    public static IResult GetInternalConfigurationHandler(
        InternalConfigurationService configService) {

        var entries = configService.GetConfigurationEntries();

        return Results.Ok(new {
            ServiceName = "Auth",
            Entries = entries
        });
    }
}