using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class WorldHandlers {
    internal static async Task<IResult> GetWorldsHandler(HttpContext context, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var worlds = await worldService.GetWorldsAsync($"AvailableTo:{userId}");
        return Results.Ok(worlds);
    }

    internal static async Task<IResult> GetWorldByIdHandler([FromRoute] Guid id, [FromServices] IWorldService worldService)
        => await worldService.GetWorldByIdAsync(id) is { } world
               ? Results.Ok(world)
               : Results.NotFound();

    internal static async Task<IResult> CreateWorldHandler(HttpContext context, [FromBody] CreateWorldRequest request, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var data = new CreateWorldData {
            Name = request.Name,
            Description = request.Description,
            BackgroundId = request.BackgroundId,
        };
        var result = await worldService.CreateWorldAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/worlds/{result.Value.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> CloneWorldHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var result = await worldService.CloneWorldAsync(userId, id);
        return result.IsSuccessful
            ? Results.Created($"/api/worlds/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateWorldHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateWorldRequest request, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var data = new UpdatedWorldData {
            Name = request.Name,
            Description = request.Description,
            BackgroundId = request.BackgroundId,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
        };
        var result = await worldService.UpdateWorldAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteWorldHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var result = await worldService.DeleteWorldAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetCampaignsHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var world = await worldService.GetWorldByIdAsync(id);
        if (world is null)
            return Results.NotFound();
        if (world.OwnerId != userId && world is not { IsPublic: true, IsPublished: true })
            return Results.Forbid();
        var campaigns = await worldService.GetCampaignsAsync(id);
        var response = campaigns.Select(CampaignCardResponse.FromCampaign);
        return Results.Ok(response);
    }

    internal static async Task<IResult> AddNewCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var result = await worldService.AddNewCampaignAsync(userId, id);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddClonedCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid campaignId, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var result = await worldService.AddClonedCampaignAsync(userId, id, campaignId);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid campaignId, [FromServices] IWorldService worldService) {
        var userId = context.User.GetUserId();
        var result = await worldService.RemoveCampaignAsync(userId, id, campaignId);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}