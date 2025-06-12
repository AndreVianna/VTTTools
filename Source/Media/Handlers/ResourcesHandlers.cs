using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

internal static class ResourcesHandlers {
    internal static async Task<IResult> UploadFileHandler([FromRoute] string type,
                                                          [FromRoute] string resource,
                                                          [FromRoute] Guid id,
                                                          [FromForm] IFormFile file,
                                                          [FromServices] IResourceService storage) {
        try {
        await using var stream = file.OpenReadStream();
        var path = $"{type}/{resource}/{id:N}";
        var resourceInfo = await file.ToResource(id, path, stream);
        if (resourceInfo.HasErrors) {
        return Results.Problem(detail: $"""
                                      The resource file for the {type} '{id}' {resource} is invalid.
                                      File name: "{file.FileName}"
                                      Reason: "{resourceInfo.Errors[0].Message}"
                                      """,
                                statusCode: StatusCodes.Status400BadRequest,
                                title: "Invalid file data.");
        }
        var result = await storage.SaveResourceAsync(resourceInfo.Value, stream);
        return result.IsSuccessful
            ? Results.Ok(resourceInfo.Value)
            : Results.Problem(detail: $"""
                                      There was a problem while uploading the resource file for the {type} '{id}' {resource}.
                                      File name: "{file.FileName}"
                                      Reason: "{result.Errors[0].Message}"
                                      """,
                              statusCode: StatusCodes.Status500InternalServerError,
                              title: "Failed to upload resource file.");
        } catch (Exception ex) {
            return Results.Problem(detail: $"""
                                      There was a problem while uploading the resource file for the {type} '{id}' {resource}.
                                      File name: "{file.FileName}"
                                      Exception: "{ex.GetType().Name}"
                                      Message: "{ex.Message}"
                                      """,
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "File upload error.");
        }
    }

    internal static async Task<IResult> EraseFileHandler([FromRoute] string type,
                                                         [FromRoute] string resource,
                                                         [FromRoute] Guid id,
                                                         [FromServices] IResourceService storage) {
        var path = $"{type}/{resource}/{id:N}";
        var result = await storage.DeleteResourceAsync(path);
        return result.IsSuccessful
            ? Results.NoContent()
            : Results.Problem(detail: $"Could not delete the resource at '{path}'.",
                              statusCode: StatusCodes.Status500InternalServerError,
                              title: "Failed to delete resource.");
    }

    internal static async Task<IResult> DownloadFileHandler([FromRoute] string type,
                                                            [FromRoute] string resource,
                                                            [FromRoute] Guid id,
                                                            [FromServices] IResourceService storage) {
        var path = $"{type}/{resource}/{id:N}";
        var download = await storage.ServeResourceAsync(path);
        return download != null
            ? Results.File(download.Content, download.Type)
            : Results.NotFound();
    }
}