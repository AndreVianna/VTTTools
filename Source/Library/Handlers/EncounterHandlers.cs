using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class EncounterHandlers {
    internal static async Task<IResult> GetEncountersHandler([FromServices] IEncounterService encounterService)
        => Results.Ok(await encounterService.GetAllAsync());

    internal static async Task<IResult> CreateEncounterHandler(HttpContext context, [FromBody] CreateEncounterRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new CreateEncounterData {
            Name = request.Name,
            Description = request.Description,
            StageId = request.StageId,
        };
        var result = await encounterService.CreateAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/encounters/{result.Value.Id}", result.Value)
            : ToErrorResult(result);
    }

    internal static async Task<IResult> GetEncounterByIdHandler([FromRoute] Guid id, [FromServices] IEncounterService encounterService)
        => await encounterService.GetByIdAsync(id) is { } ep
               ? Results.Ok(ep)
               : Results.NotFound();

    internal static async Task<IResult> UpdateEncounterHandler(HttpContext context, [FromRoute] Guid id, [FromBody] EncounterUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterUpdateData {
            AdventureId = request.AdventureId,
            Name = request.Name,
            Description = request.Description,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
        };
        var result = await encounterService.UpdateAsync(userId, id, data);
        return ToResult(result);
    }

    internal static async Task<IResult> DeleteEncounterHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.DeleteAsync(userId, id);
        return ToResult(result);
    }

    internal static async Task<IResult> GetActorsHandler([FromRoute] Guid id, [FromServices] IEncounterService encounterService)
        => Results.Ok(await encounterService.GetActorsAsync(id));

    internal static async Task<IResult> AddActorHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] EncounterActorAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterActorAddData {
            Name = request.Name,
            Position = request.Position,
            Rotation = request.Rotation,
            Elevation = request.Elevation,
            Size = request.Size,
            DisplayId = request.DisplayId,
            Frame = request.Frame,
            ControlledBy = request.ControlledBy,
            IsHidden = request.IsHidden,
            IsLocked = request.IsLocked,
        };
        var result = await encounterService.AddActorAsync(userId, id, assetId, data);
        return result.IsSuccessful
            ? Results.Ok(ToActorResponse(result.Value))
            : ToErrorResult(result);
    }

    internal static async Task<IResult> UpdateActorHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterActorUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterActorUpdateData {
            Name = request.Name,
            Position = request.Position,
            Rotation = request.Rotation,
            Elevation = request.Elevation,
            Size = request.Size,
            DisplayId = request.DisplayId,
            Frame = request.Frame,
            ControlledBy = request.ControlledBy,
            IsHidden = request.IsHidden,
            IsLocked = request.IsLocked,
        };
        var result = await encounterService.UpdateActorAsync(userId, id, (ushort)index, data);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveActorHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveActorAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    internal static async Task<IResult> GetObjectsHandler([FromRoute] Guid id, [FromServices] IEncounterService encounterService)
        => Results.Ok(await encounterService.GetObjectsAsync(id));

    internal static async Task<IResult> AddObjectHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] EncounterObjectAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterObjectAddData {
            Name = request.Name,
            Position = request.Position,
            Rotation = request.Rotation,
            Elevation = request.Elevation,
            Size = request.Size,
            DisplayId = request.DisplayId,
            ClosedDisplayId = request.ClosedDisplayId,
            OpenedDisplayId = request.OpenedDisplayId,
            DestroyedDisplayId = request.DestroyedDisplayId,
            State = request.State,
            IsHidden = request.IsHidden,
            IsLocked = request.IsLocked,
        };
        var result = await encounterService.AddObjectAsync(userId, id, assetId, data);
        return result.IsSuccessful
            ? Results.Ok(ToObjectResponse(result.Value))
            : ToErrorResult(result);
    }

    internal static async Task<IResult> UpdateObjectHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterObjectUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterObjectUpdateData {
            Name = request.Name,
            Position = request.Position,
            Rotation = request.Rotation,
            Elevation = request.Elevation,
            Size = request.Size,
            DisplayId = request.DisplayId,
            ClosedDisplayId = request.ClosedDisplayId,
            OpenedDisplayId = request.OpenedDisplayId,
            DestroyedDisplayId = request.DestroyedDisplayId,
            State = request.State,
            IsHidden = request.IsHidden,
            IsLocked = request.IsLocked,
        };
        var result = await encounterService.UpdateObjectAsync(userId, id, (ushort)index, data);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveObjectHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveObjectAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    internal static async Task<IResult> GetEffectsHandler([FromRoute] Guid id, [FromServices] IEncounterService encounterService)
        => Results.Ok(await encounterService.GetEffectsAsync(id));

    internal static async Task<IResult> AddEffectHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid assetId, [FromBody] EncounterEffectAddRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterEffectAddData {
            Name = request.Name,
            Position = request.Position,
            Rotation = request.Rotation,
            State = request.State,
            IsHidden = request.IsHidden,
            TriggerRegion = request.TriggerRegion,
            DisplayId = request.DisplayId,
            EnabledDisplayId = request.EnabledDisplayId,
            DisabledDisplayId = request.DisabledDisplayId,
            OnTriggerDisplayId = request.OnTriggerDisplayId,
            TriggeredDisplayId = request.TriggeredDisplayId,
        };
        var result = await encounterService.AddEffectAsync(userId, id, assetId, data);
        return result.IsSuccessful
            ? Results.Ok(ToEffectResponse(result.Value))
            : ToErrorResult(result);
    }

    internal static async Task<IResult> UpdateEffectHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromBody] EncounterEffectUpdateRequest request, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var data = new EncounterEffectUpdateData {
            Name = request.Name,
            Position = request.Position,
            Rotation = request.Rotation,
            State = request.State,
            IsHidden = request.IsHidden,
            TriggerRegion = request.TriggerRegion,
            DisplayId = request.DisplayId,
            EnabledDisplayId = request.EnabledDisplayId,
            DisabledDisplayId = request.DisabledDisplayId,
            OnTriggerDisplayId = request.OnTriggerDisplayId,
            TriggeredDisplayId = request.TriggeredDisplayId,
        };
        var result = await encounterService.UpdateEffectAsync(userId, id, (ushort)index, data);
        return ToResult(result);
    }

    internal static async Task<IResult> RemoveEffectHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] int index, [FromServices] IEncounterService encounterService) {
        var userId = context.User.GetUserId();
        var result = await encounterService.RemoveEffectAsync(userId, id, (ushort)index);
        return ToResult(result);
    }

    private static EncounterActorResponse ToActorResponse(EncounterActor actor)
        => new() {
            Index = actor.Index,
            AssetId = actor.Asset.Id,
            Name = actor.Name,
            Position = actor.Position,
            Rotation = actor.Rotation,
            Elevation = actor.Elevation,
            Size = actor.Size,
            Display = actor.Display,
            Frame = actor.Frame,
            ControlledBy = actor.ControlledBy,
            IsHidden = actor.IsHidden,
            IsLocked = actor.IsLocked,
        };

    private static EncounterObjectResponse ToObjectResponse(EncounterObject prop)
        => new() {
            Index = prop.Index,
            AssetId = prop.Asset.Id,
            Name = prop.Name,
            Position = prop.Position,
            Rotation = prop.Rotation,
            Elevation = prop.Elevation,
            Size = prop.Size,
            Display = prop.Display,
            ClosedDisplay = prop.ClosedDisplay,
            OpenedDisplay = prop.OpenedDisplay,
            DestroyedDisplay = prop.DestroyedDisplay,
            State = prop.State,
            IsHidden = prop.IsHidden,
            IsLocked = prop.IsLocked,
        };

    private static EncounterEffectResponse ToEffectResponse(EncounterEffect effect)
        => new() {
            Index = effect.Index,
            Name = effect.Name,
            Position = effect.Position,
            Rotation = effect.Rotation,
            AssetId = effect.Asset.Id,
            State = effect.State,
            IsHidden = effect.IsHidden,
            TriggerRegion = effect.TriggerRegion,
            Display = effect.Display,
            EnabledDisplay = effect.EnabledDisplay,
            DisabledDisplay = effect.DisabledDisplay,
            OnTriggerDisplay = effect.OnTriggerDisplay,
            TriggeredDisplay = effect.TriggeredDisplay,
        };

    private static IResult ToResult(Result result)
        => result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());

    private static IResult ToErrorResult<T>(Result<T> result)
        => result.Errors[0].Message == "NotFound"
            ? Results.NotFound()
            : result.Errors[0].Message == "NotAllowed"
                ? Results.Forbid()
                : Results.ValidationProblem(result.Errors.GroupedBySource());
}