using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

internal static class ResourcesHandlers {
    internal static async Task<IResult> UploadFileHandler([FromRoute] string type,
                                                          [FromRoute] Guid id,
                                                          [FromForm] IFormFile file,
                                                          [FromServices] IMediaService storage) {
        await using var stream = file.OpenReadStream();
        var fileInfo = await ResourceFileHandler.GetResourceFileInfo(file.FileName, stream);
        if (fileInfo is null) {
            return Results.Problem(detail: $"The file '{file.FileName}' is not a valid resource file.",
                                   statusCode: StatusCodes.Status400BadRequest,
                                   title: "Invalid resource file.");
        }

        if (stream.CanSeek) stream.Position = 0;
        var result = await storage.SaveUploadedFileAsync(type, id, fileInfo, stream);
        return result.IsSuccessful
            ? Results.NoContent()
            : Results.Problem(detail: $"""
                                      The file for asset '{id}' was not saved in the media storage.
                                      File name: "{file.FileName}"
                                      Reason: "{result.Errors[0].Message}"
                                      """,
                              statusCode: StatusCodes.Status500InternalServerError,
                              title: "Failed to save the asset image.");
    }
}