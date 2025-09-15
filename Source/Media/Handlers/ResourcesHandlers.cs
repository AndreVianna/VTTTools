using VttTools.Infrastructure;
using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Media.Handlers;

internal static class ResourcesHandlers {
    internal static async Task<IResult> UploadFileHandler([FromForm] Guid id,
                                                          [FromForm] string type,
                                                          [FromForm] string resource,
                                                          [FromForm] IFormFile file,
                                                          [FromServices] IResourceService storage) {
        var request = new UploadRequest
        {
            Id = id,
            Type = type,
            Resource = resource,
            File = file.ToFileData()
        };
        try {
            await using var stream = request.File.OpenReadStream();
            var path = $"{request.Type}/{request.Resource}/{request.Id:N}";
            var data = await request.File.ToData(path, stream);
            if (data.HasErrors) {
                return Results.Problem(detail: $"""
                                          The resource file for the {request.Type} '{request.Id}' {request.Resource} is invalid.
                                          File name: "{request.File.FileName}"
                                          Reason: "{data.Errors[0].Message}"
                                          """,
                                        statusCode: StatusCodes.Status400BadRequest,
                                        title: "Invalid file data.");
            }
            var result = await storage.SaveResourceAsync(data.Value, stream);
            return result.IsSuccessful
                ? Results.Ok(data.Value)
                : Results.Problem(detail: $"""
                                          There was a problem while uploading the resource file for the {request.Type} '{request.Id}' {request.Resource}.
                                          File name: "{request.File.FileName}"
                                          Reason: "{result.Errors[0].Message}"
                                          """,
                                  statusCode: StatusCodes.Status500InternalServerError,
                                  title: "Failed to upload resource file.");
        }
        catch (Exception ex) {
            return Results.Problem(detail: $"""
                                      There was a problem while uploading the resource file for the {request.Type} '{request.Id}' {request.Resource}.
                                      File name: "{request.File.FileName}"
                                      Exception: "{ex.GetType().Name}"
                                      Message: "{ex.Message}"
                                      """,
                                   statusCode: StatusCodes.Status500InternalServerError,
                                   title: "File upload error.");
        }
    }

    internal static async Task<IResult> DeleteFileHandler([FromRoute] Guid id,
                                                          [FromServices] IResourceService storage) {
        var result = await storage.DeleteResourceAsync(id);
        return result.IsSuccessful
            ? Results.NoContent()
            : Results.Problem(detail: $"Could not delete the resource {id}.",
                              statusCode: StatusCodes.Status500InternalServerError,
                              title: "Failed to delete resource.");
    }

    internal static async Task<IResult> DownloadFileHandler([FromRoute] Guid id,
                                                            [FromServices] IResourceService storage) {
        var download = await storage.ServeResourceAsync(id);
        return download != null
            ? Results.File(download.Stream, download.ContentType, download.FileName)
            : Results.NotFound();
    }
}