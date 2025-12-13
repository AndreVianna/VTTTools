using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Library.Handlers;

public static class LibraryAdminHandlers {
    public sealed record CreateContentRequest {
        public required string Name { get; init; }
        public string Description { get; init; } = string.Empty;
    }

    public sealed record UpdateContentRequest {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public bool? IsPublished { get; init; }
        public bool? IsPublic { get; init; }
    }

    public static async Task<IResult> GetConfigHandler(
        ILibraryConfigService service,
        CancellationToken ct) {
        try {
            var response = await service.GetConfigAsync(ct);
            return Results.Ok(response);
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while retrieving library configuration");
        }
    }
}