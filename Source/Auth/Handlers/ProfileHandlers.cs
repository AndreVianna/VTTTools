using Microsoft.AspNetCore.Mvc;

using VttTools.Auth.ApiContracts;
using VttTools.Auth.Services;
using VttTools.Extensions;
using VttTools.Infrastructure;
using VttTools.Media.Contracts;
using VttTools.Media.Services;
using VttTools.Utilities;

namespace VttTools.Auth.Handlers;

public static class ProfileHandlers {
    public static async Task<Microsoft.AspNetCore.Http.IResult> GetProfileHandler(
        HttpContext context,
        [FromServices] IProfileService profileService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await profileService.GetProfileAsync(userId, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            ["userId"] = [response.Message ?? "Failed to retrieve profile"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> UpdateProfileHandler(
        HttpContext context,
        [FromBody] UpdateProfileRequest request,
        [FromServices] IProfileService profileService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await profileService.UpdateProfileAsync(userId, request, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Failed to update profile"]
        };

        return Results.ValidationProblem(errors);
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> UpdateAvatarHandler(
        HttpContext context,
        [FromForm] IFormFile file,
        [FromServices] IProfileService profileService,
        [FromServices] IResourceService resourceService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        if (file == null || file.Length == 0) {
            var errors = new Dictionary<string, string[]> {
                ["file"] = ["File is required"]
            };
            return Results.ValidationProblem(errors);
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)) {
            var errors = new Dictionary<string, string[]> {
                ["file"] = ["Only image files are allowed"]
            };
            return Results.ValidationProblem(errors);
        }

        try {
            var resourceId = Guid.CreateVersion7();

            await using var stream = file.OpenReadStream();
            var fileData = file.ToFileData();
            var resourcePath = $"images/avatars/{resourceId:N}";
            var addResourceData = await fileData.ToData(resourcePath, stream);

            if (addResourceData.HasErrors) {
                var errors = new Dictionary<string, string[]> {
                    ["file"] = [addResourceData.Errors[0].Message]
                };
                return Results.ValidationProblem(errors);
            }

            stream.Position = 0;
            var uploadResult = await resourceService.SaveResourceAsync(
                addResourceData.Value,
                stream,
                userId,
                "avatar",
                userId,
                isPublic: false,
                ct);

            if (!uploadResult.IsSuccessful) {
                var errors = new Dictionary<string, string[]> {
                    ["file"] = [uploadResult.Errors[0].Message]
                };
                return Results.ValidationProblem(errors);
            }

            var response = await profileService.UpdateAvatarAsync(userId, resourceId, ct);

            if (response.Success)
                return Results.Ok(response);

            var profileErrors = new Dictionary<string, string[]> {
                ["avatarResourceId"] = [response.Message ?? "Failed to update avatar"]
            };

            return Results.ValidationProblem(profileErrors);
        }
        catch (Exception ex) {
            var errors = new Dictionary<string, string[]> {
                [""] = [$"Error uploading avatar: {ex.Message}"]
            };
            return Results.ValidationProblem(errors);
        }
    }

    public static async Task<Microsoft.AspNetCore.Http.IResult> RemoveAvatarHandler(
        HttpContext context,
        [FromServices] IProfileService profileService,
        CancellationToken ct = default) {

        var userId = context.User.GetUserId();
        if (userId == Guid.Empty) {
            return Results.Unauthorized();
        }

        var response = await profileService.RemoveAvatarAsync(userId, ct);

        if (response.Success)
            return Results.Ok(response);

        var errors = new Dictionary<string, string[]> {
            [""] = [response.Message ?? "Failed to remove avatar"]
        };

        return Results.ValidationProblem(errors);
    }
}