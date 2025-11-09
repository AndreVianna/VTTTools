using static VttTools.Utilities.ErrorCollectionExtensions;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Library.Handlers;

internal static class CampaignHandlers {
    internal static async Task<IResult> GetCampaignsHandler(HttpContext context, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var campaigns = await campaignService.GetCampaignsAsync($"AvailableTo:{userId}");
        return Results.Ok(campaigns);
    }

    internal static async Task<IResult> GetCampaignByIdHandler([FromRoute] Guid id, [FromServices] ICampaignService campaignService)
        => await campaignService.GetCampaignByIdAsync(id) is { } campaign
               ? Results.Ok(campaign)
               : Results.NotFound();

    internal static async Task<IResult> CreateCampaignHandler(HttpContext context, [FromBody] CreateCampaignRequest request, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var data = new CreateCampaignData(userId) {
            Name = request.Name,
            Description = request.Description,
            BackgroundId = request.BackgroundId,
        };
        var result = await campaignService.CreateCampaignAsync(userId, data);
        return result.IsSuccessful
            ? Results.Created($"/api/campaigns/{result.Value.Id}", result.Value)
            : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> CloneCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var result = await campaignService.CloneCampaignAsync(userId, id);
        return result.IsSuccessful
            ? Results.Created($"/api/campaigns/{result.Value.Id}", result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> UpdateCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromBody] UpdateCampaignRequest request, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var data = new UpdatedCampaignData {
            Name = request.Name,
            Description = request.Description,
            BackgroundId = request.BackgroundId,
            IsPublished = request.IsPublished,
            IsPublic = request.IsPublic,
        };
        var result = await campaignService.UpdateCampaignAsync(userId, id, data);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> DeleteCampaignHandler(HttpContext context, [FromRoute] Guid id, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var result = await campaignService.DeleteCampaignAsync(userId, id);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetAdventuresHandler([FromRoute] Guid id, [FromServices] ICampaignService campaignService)
        => Results.Ok(await campaignService.GetAdventuresAsync(id));

    internal static async Task<IResult> AddNewAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var result = await campaignService.AddNewAdventureAsync(userId, id);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> AddClonedAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid adventureId, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var result = await campaignService.AddClonedAdventureAsync(userId, id, adventureId);
        return result.IsSuccessful
            ? Results.Ok(result.Value)
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> RemoveAdventureHandler(HttpContext context, [FromRoute] Guid id, [FromRoute] Guid adventureId, [FromServices] ICampaignService campaignService) {
        var userId = context.User.GetUserId();
        var result = await campaignService.RemoveAdventureAsync(userId, id, adventureId);
        return result.IsSuccessful
            ? Results.NoContent()
            : result.Errors[0].Message == "NotFound"
                ? Results.NotFound()
                : result.Errors[0].Message == "NotAllowed"
                    ? Results.Forbid()
                    : Results.ValidationProblem(result.Errors.GroupedBySource());
    }
}
