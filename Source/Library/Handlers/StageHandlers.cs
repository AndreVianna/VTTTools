using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class StageHandlers {
    internal static async Task<IResult> GetStagesHandler([FromServices] StageService stageService)
        => Results.Ok(await stageService.GetAllAsync());

    internal static async Task<IResult> GetStageByIdHandler([FromRoute] Guid id, [FromServices] StageService stageService)
        => await stageService.GetByIdAsync(id) is { } stage
               ? Results.Ok(stage)
               : Results.NotFound();

    internal static async Task<IResult> CreateStageHandler(HttpContext context, [FromBody] CreateStageRequest request, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var data = new CreateStageData {
            Name = request.Name,
            Description = request.Description,
        };
        var result = await stageService.CreateAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{result.Value.Id}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> CloneStageHandler(HttpContext context, [FromRoute] Guid id, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.CloneAsync(userId, id);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{result.Value.Id}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> UpdateStageHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateStageRequest request, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var data = new UpdateStageData {
            Name = request.Name,
            Description = request.Description,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
            Settings = MapSettingsUpdate(request.Settings),
            Grid = MapGridUpdate(request.Grid),
        };
        var result = await stageService.UpdateAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : ToResult(result);
    }

    internal static async Task<IResult> DeleteStageHandler(HttpContext context, [FromRoute] Guid id, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.DeleteAsync(userId, id);
        return ToResult(result);
    }

    internal static async Task<IResult> AddWallHandler(HttpContext context, [FromRoute] Guid id, [FromBody] StageWall wall, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.AddWallAsync(userId, id, wall);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{id}/walls/{result.Value.Index}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> UpdateWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] StageWall wall, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.UpdateWallAsync(userId, id, (ushort)index, wall);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveWallHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.RemoveWallAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    internal static async Task<IResult> AddRegionHandler(HttpContext context, [FromRoute] Guid id, [FromBody] StageRegion region, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.AddRegionAsync(userId, id, region);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{id}/regions/{result.Value.Index}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> UpdateRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] StageRegion region, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.UpdateRegionAsync(userId, id, (ushort)index, region);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveRegionHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.RemoveRegionAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    internal static async Task<IResult> AddLightHandler(HttpContext context, [FromRoute] Guid id, [FromBody] StageLight light, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.AddLightAsync(userId, id, light);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{id}/lights/{result.Value.Index}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> UpdateLightHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] StageLight light, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.UpdateLightAsync(userId, id, (ushort)index, light);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveLightHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.RemoveLightAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    internal static async Task<IResult> AddDecorationHandler(HttpContext context, [FromRoute] Guid id, [FromBody] StageElement decoration, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.AddDecorationAsync(userId, id, decoration);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{id}/elements/{result.Value.Index}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> UpdateDecorationHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] StageElement decoration, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.UpdateDecorationAsync(userId, id, (ushort)index, decoration);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveDecorationHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.RemoveDecorationAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    internal static async Task<IResult> AddSoundHandler(HttpContext context, [FromRoute] Guid id, [FromBody] StageSound sound, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.AddSoundAsync(userId, id, sound);
        return result.IsSuccessful
            ? Results.Created($"/api/stages/{id}/sounds/{result.Value.Index}", result.Value)
            : ToResult(result);
    }

    internal static async Task<IResult> UpdateSoundHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] StageSound sound, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.UpdateSoundAsync(userId, id, (ushort)index, sound);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveSoundHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] StageService stageService) {
        var userId = context.User.GetUserId();
        var result = await stageService.RemoveSoundAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    private static Optional<UpdateStageData.SettingsUpdate> MapSettingsUpdate(Optional<UpdateStageRequest.SettingsUpdate> settings) {
        if (!settings.IsSet)
            return default;

        var s = settings.Value;
        return new UpdateStageData.SettingsUpdate {
            MainBackgroundId = s.MainBackgroundId,
            AlternateBackgroundId = s.AlternateBackgroundId,
            AmbientSoundId = s.AmbientSoundId,
            AmbientSoundVolume = s.AmbientSoundVolume,
            AmbientSoundLoop = s.AmbientSoundLoop,
            AmbientSoundIsPlaying = s.AmbientSoundIsPlaying,
            ZoomLevel = s.ZoomLevel,
            Panning = s.Panning,
            AmbientLight = s.AmbientLight,
            Weather = s.Weather,
        };
    }

    private static Optional<UpdateStageData.GridUpdate> MapGridUpdate(Optional<UpdateStageRequest.GridUpdate> grid) {
        if (!grid.IsSet)
            return default;

        var g = grid.Value;
        return new UpdateStageData.GridUpdate {
            Type = g.Type,
            CellSize = g.CellSize,
            Offset = g.Offset,
            Scale = g.Scale,
        };
    }

    private static IResult ToResult(IResultBase result)
        => result.IsSuccessful
            ? Results.NoContent()
            : ToErrorResult(result);

    private static IResult ToErrorResult(IHasErrors result)
        => result.Errors[0].Message switch {
            "NotFound" => Results.NotFound(),
            "NotAllowed" => Results.Forbid(),
            _ => Results.ValidationProblem(result.Errors.GroupedBySource()),
        };
}
