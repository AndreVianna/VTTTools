// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Builder;

internal static class WebApplicationExtensions {
    public static void MapGameMeetingManagementEndpoints(this WebApplication app) {
        var meetings = app.MapGroup("/api/meetings")
                          .RequireAuthorization();

        meetings.MapPost("/", async (
            HttpContext context,
            [FromBody] CreateMeetingRequest request,
            [FromServices] IMeetingService meetingService) => {
                var userId = GetUserId(context.User);
                var data = new CreateMeetingData {
                    Name = request.Name,
                    EpisodeId = request.EpisodeId,
                };
                var result = await meetingService.CreateMeetingAsync(userId, data);
                return result.IsSuccessful
                           ? Results.Created($"/api/meetings/{result.Value.Id}", result.Value)
                           : Results.ValidationProblem(result.Errors.GroupedBySource());
            });

        meetings.MapGet("/", async (
            HttpContext context,
            [FromServices] IMeetingService meetingService) => {
                var userId = GetUserId(context.User);
                var userMeetings = await meetingService.GetMeetingsAsync(userId);
                return Results.Ok(userMeetings);
            });

        meetings.MapGet("/{id:guid}", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] IMeetingService meetingService) => {
                var userId = GetUserId(context.User);
                return await meetingService.GetMeetingAsync(userId, id) is { } meeting
                    ? Results.Ok(meeting)
                    : Results.NotFound();
            });

        meetings.MapPut("/{id:guid}", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromBody] UpdateMeetingRequest request,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var data = new UpdateMeetingData {
                        Name = request.Name,
                    };
                    var result = await meetingService.UpdateMeetingAsync(userId, id, data);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        meetings.MapDelete("/{id:guid}", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await meetingService.DeleteMeetingAsync(userId, id);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        meetings.MapPost("/{id:guid}/join", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromBody] JoinMeetingRequest request,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await meetingService.JoinMeetingAsync(userId, id, request.JoinAs);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        meetings.MapPost("/{id:guid}/leave", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await meetingService.LeaveMeetingAsync(userId, id);
                    return Results.StatusCode((int)result.Status);
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        meetings.MapPost("/{id:guid}/episodes/{episode:guid}/activate", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromRoute] Guid episode,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await meetingService.SetActiveEpisodeAsync(userId, id, episode);
                    return result.Status switch {
                        HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
                        _ => Results.StatusCode((int)result.Status),
                    };
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        meetings.MapPost("/{id:guid}/start", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await meetingService.StartMeetingAsync(userId, id);
                    return Results.StatusCode((int)result.Status);
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });

        meetings.MapPost("/{id:guid}/stop", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromServices] IMeetingService meetingService) => {
                try {
                    var userId = GetUserId(context.User);
                    var result = await meetingService.StopMeetingAsync(userId, id);
                    return Results.StatusCode((int)result.Status);
                }
                catch (Exception ex) {
                    return Results.InternalServerError(ex);
                }
            });
    }

    /// <summary>
    /// Maps endpoints for Asset templates CRUD operations.
    /// </summary>
    public static void MapAssetManagementEndpoints(this WebApplication app) {
        var assets = app.MapGroup("/api/assets").RequireAuthorization();

        // List all assets
        assets.MapGet("/", async ([FromServices] IAssetService svc)
            => Results.Ok(await svc.GetAssetsAsync()));

        // Get a specific asset
        assets.MapGet("/{id:guid}", async (Guid id, [FromServices] IAssetService assetService)
            => await assetService.GetAssetAsync(id) is { } asset
                   ? Results.Ok(asset)
                   : Results.NotFound());

        // Create a new asset
        assets.MapPost("/", async (HttpContext context, [FromBody] CreateAssetRequest request, [FromServices] IAssetService assetService) => {
            var userId = GetUserId(context.User);
            var created = await assetService.CreateAssetAsync(userId, request);
            return Results.Created($"/api/assets/{created.Id}", created);
        });

        // Update an existing asset
        assets.MapPut("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAssetRequest request, [FromServices] IAssetService assetService)
            => await assetService.UpdateAssetAsync(GetUserId(context.User), id, request) is { } asset
                   ? Results.Ok(asset)
                   : Results.NotFound());

        // Delete an asset
        assets.MapDelete("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromServices] IAssetService assetService)
            => await assetService.DeleteAssetAsync(GetUserId(context.User), id)
                   ? Results.NoContent()
                   : Results.NotFound());

        // Upload a file for an asset (multipart/form-data)
        assets.MapPost("/{id:guid}/upload", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromForm] IFormFile file,
            [FromServices] IStorageService storage,
            [FromServices] IAssetService assetService) => {
                var userId = GetUserId(context.User);
                // ensure asset exists and belongs to user or admin
                var asset = await assetService.GetAssetAsync(id);
                if (asset is null || asset.OwnerId != userId)
                    return Results.NotFound();
                // store file
                await using var stream = file.OpenReadStream();
                var url = await storage.UploadImageAsync(stream, file.FileName);
                // update asset source
                var update = new UpdateAssetRequest { Source = url };
                var updated = await assetService.UpdateAssetAsync(userId, id, update);
                return updated != null ? Results.Ok(updated) : Results.BadRequest();
            });
    }

    public static void MapAdventureManagementEndpoints(this WebApplication app) {
        var adventures = app.MapGroup("/api/adventures")
                            .RequireAuthorization();

        adventures.MapGet("/", async ([FromServices] IAdventureService adventureService)
            => Results.Ok(await adventureService.GetAdventuresAsync()));

        adventures.MapGet("/{id:guid}", async (Guid id, [FromServices] IAdventureService adventureService)
            => await adventureService.GetAdventureAsync(id) is { } adv
                   ? Results.Ok(adv)
                   : Results.NotFound());

        // List episodes for an adventure
        adventures.MapGet("/{id:guid}/episodes", async (Guid id, [FromServices] IAdventureService adventureService)
            => Results.Ok(await adventureService.GetEpisodesAsync(id)));

        // Create a new episode under an adventure
        adventures.MapPost("/{id:guid}/episodes", async (HttpContext context, [FromRoute] Guid id, [FromBody] CreateEpisodeRequest request, IAdventureService adventureService) => {
            var userId = GetUserId(context.User);
            var created = await adventureService.CreateEpisodeAsync(userId, id, request);
            return created != null
                       ? Results.Created($"/api/episodes/{created.Id}", created)
                   : Results.BadRequest();
        });

        // Create a new adventure
        adventures.MapPost("/", async (HttpContext context, [FromBody] CreateAdventureRequest request, [FromServices] IAdventureService adventureService) => {
            try {
                var userId = GetUserId(context.User);
                var created = await adventureService.CreateAdventureAsync(userId, request);
                return Results.Created($"/api/adventures/{created.Id}", created);
            }
            catch (Exception ex) {
                return Results.BadRequest(ex.Message);
            }
        });

        // Update an existing adventure
        adventures.MapPut("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAdventureRequest request, [FromServices] IAdventureService adventureService) => {
            var userId = GetUserId(context.User);
            var updated = await adventureService.UpdateAdventureAsync(userId, id, request);
            return updated != null ? Results.Ok(updated) : Results.NotFound();
        });

        // Delete an adventure
        adventures.MapDelete("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService) => {
            var userId = GetUserId(context.User);
            var deleted = await adventureService.DeleteAdventureAsync(userId, id);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        // Clone an adventure template
        adventures.MapPost("/{id:guid}/clone", async (HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService)
            => await adventureService.CloneAdventureAsync(GetUserId(context.User), id) is { } clone
                   ? Results.Created($"/api/adventures/{clone.Id}", clone)
                   : Results.NotFound());

        var episodes = app.MapGroup("/api/episodes")
                            .RequireAuthorization();

        episodes.MapGet("/{id:guid}", async (Guid id, [FromServices] IAdventureService adventureService)
            => await adventureService.GetEpisodeAsync(id) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound());

        // Update an existing episode
        episodes.MapPut("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromBody] UpdateEpisodeRequest request, [FromServices] IAdventureService adventureService)
            => await adventureService.UpdateEpisodeAsync(GetUserId(context.User), id, request) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound());

        // Delete an episode
        episodes.MapDelete("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService)
            => await adventureService.DeleteEpisodeAsync(GetUserId(context.User), id)
                   ? Results.NoContent()
                   : Results.NotFound());

        // Clone an episode template
        episodes.MapPost("/{id:guid}/clone", async (HttpContext context, [FromRoute] Guid id, [FromServices] IAdventureService adventureService)
            => await adventureService.CloneEpisodeAsync(GetUserId(context.User), id) is { } clone
                   ? Results.Created($"/api/episodes/{clone.Id}", clone)
                   : Results.NotFound());
    }

    private static Guid GetUserId(ClaimsPrincipal principal) {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userIdClaim?.Value, out var userId)
                   ? userId
                   : Guid.Empty;
    }
}