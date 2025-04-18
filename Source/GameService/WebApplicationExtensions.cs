// ReSharper disable once CheckNamespace
using Microsoft.AspNetCore.Http;

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
    public static void MapAssetManagementEndpoints(this WebApplication app)
    {
        var assets = app.MapGroup("/api/assets").RequireAuthorization();

        // List all assets
        assets.MapGet("/", async ([FromServices] IAssetService svc)
            => Results.Ok(await svc.GetAssetsAsync()));

        // Get a specific asset
        assets.MapGet("/{id:guid}", async (Guid id, IAssetService svc)
            => await svc.GetAssetAsync(id) is { } asset
                   ? Results.Ok(asset)
                   : Results.NotFound());

        // Create a new asset
        assets.MapPost("/", async (HttpContext context, [FromBody] CreateAssetRequest request, IAssetService svc) =>
        {
            var userId = GetUserId(context.User);
            var created = await svc.CreateAssetAsync(userId, request);
            return Results.Created($"/api/assets/{created.Id}", created);
        });

        // Update an existing asset
        assets.MapPut("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAssetRequest request, IAssetService svc)
            => await svc.UpdateAssetAsync(GetUserId(context.User), id, request) is { } asset
                   ? Results.Ok(asset)
                   : Results.NotFound());

        // Delete an asset
        assets.MapDelete("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, IAssetService svc)
            => await svc.DeleteAssetAsync(GetUserId(context.User), id)
                   ? Results.NoContent()
                   : Results.NotFound());
        
        // Upload a file for an asset (multipart/form-data)
        assets.MapPost("/{id:guid}/upload", async (
            HttpContext context,
            [FromRoute] Guid id,
            [FromForm] IFormFile file,
            IStorageService storage,
            IAssetService svc) =>
        {
            var userId = GetUserId(context.User);
            // ensure asset exists and belongs to user or admin
            var asset = await svc.GetAssetAsync(id);
            if (asset is null || asset.OwnerId != userId)
                return Results.NotFound();
            // store file
            using var stream = file.OpenReadStream();
            var url = await storage.UploadImageAsync(stream, file.FileName);
            // update asset source
            var update = new UpdateAssetRequest { Source = url };
            var updated = await svc.UpdateAssetAsync(userId, id, update);
            return updated is { } a ? Results.Ok(a) : Results.BadRequest();
        });
    }

    public static void MapAdventureManagementEndpoints(this WebApplication app) {
        var adventures = app.MapGroup("/api/adventures")
                            .RequireAuthorization();

        adventures.MapGet("/", async ([FromServices] IAdventureService svc)
            => Results.Ok(await svc.GetAdventuresAsync()));

        adventures.MapGet("/{id:guid}", async (Guid id, IAdventureService svc)
            => await svc.GetAdventureAsync(id) is { } adv
                   ? Results.Ok(adv)
                   : Results.NotFound());

        // List episodes for an adventure
        adventures.MapGet("/{id:guid}/episodes", async (Guid id, IAdventureService svc)
            => Results.Ok(await svc.GetEpisodesAsync(id)));
        
        // Create a new episode under an adventure
        adventures.MapPost("/{id:guid}/episodes", async (HttpContext context, [FromRoute] Guid id, [FromBody] CreateEpisodeRequest request, IAdventureService svc) =>
        {
            var userId = GetUserId(context.User);
            var created = await svc.CreateEpisodeAsync(userId, id, request);
            return created is { } ep
                   ? Results.Created($"/api/episodes/{ep.Id}", ep)
                   : Results.BadRequest();
        });
        
        // Create a new adventure
        adventures.MapPost("/", async (HttpContext context, [FromBody] CreateAdventureRequest request, IAdventureService svc) =>
        {
            try
            {
                var userId = GetUserId(context.User);
                var created = await svc.CreateAdventureAsync(userId, request);
                return Results.Created($"/api/adventures/{created.Id}", created);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });
        
        // Update an existing adventure
        adventures.MapPut("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromBody] UpdateAdventureRequest request, IAdventureService svc) =>
        {
            var userId = GetUserId(context.User);
            var updated = await svc.UpdateAdventureAsync(userId, id, request);
            return updated is { } adv ? Results.Ok(adv) : Results.NotFound();
        });
        
        // Delete an adventure
        adventures.MapDelete("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, IAdventureService svc) =>
        {
            var userId = GetUserId(context.User);
            var deleted = await svc.DeleteAdventureAsync(userId, id);
            return deleted ? Results.NoContent() : Results.NotFound();
        });
        
        // Clone an adventure template
        adventures.MapPost("/{id:guid}/clone", async (HttpContext context, [FromRoute] Guid id, IAdventureService svc)
            => await svc.CloneAdventureAsync(GetUserId(context.User), id) is { } clone
                   ? Results.Created($"/api/adventures/{clone.Id}", clone)
                   : Results.NotFound());

        var episodes = app.MapGroup("/api/episodes")
                            .RequireAuthorization();

        episodes.MapGet("/{id:guid}", async (Guid id, IAdventureService svc)
            => await svc.GetEpisodeAsync(id) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound());
        
        // Update an existing episode
        episodes.MapPut("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, [FromBody] UpdateEpisodeRequest request, IAdventureService svc)
            => await svc.UpdateEpisodeAsync(GetUserId(context.User), id, request) is { } ep
                   ? Results.Ok(ep)
                   : Results.NotFound());

        // Delete an episode
        episodes.MapDelete("/{id:guid}", async (HttpContext context, [FromRoute] Guid id, IAdventureService svc)
            => await svc.DeleteEpisodeAsync(GetUserId(context.User), id)
                   ? Results.NoContent()
                   : Results.NotFound());

        // Clone an episode template
        episodes.MapPost("/{id:guid}/clone", async (HttpContext context, [FromRoute] Guid id, IAdventureService svc)
            => await svc.CloneEpisodeAsync(GetUserId(context.User), id) is { } clone
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