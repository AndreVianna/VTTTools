using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.GameService.Handlers;

internal static class MeetingHandlers {
    internal static async Task<IResult> CreateMeetingHandler(
        HttpContext context,
        [FromBody] CreateMeetingRequest request,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var data = new CreateMeetingData {
            Subject = request.Subject,
            EpisodeId = request.EpisodeId,
        };
        var result = await meetingService.CreateMeetingAsync(userId, data);
        return result.IsSuccessful
                   ? Results.Created($"/api/meetings/{result.Value.Id}", result.Value)
                   : Results.ValidationProblem(result.Errors.GroupedBySource());
    }

    internal static async Task<IResult> GetMeetingsHandler(
        HttpContext context,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var userMeetings = await meetingService.GetMeetingsAsync(userId);
        return Results.Ok(userMeetings);
    }

    internal static async Task<IResult> GetMeetingByIdHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        return await meetingService.GetMeetingAsync(userId, id) is { } meeting
            ? Results.Ok(meeting)
            : Results.NotFound();
    }

    internal static async Task<IResult> UpdateMeetingHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] UpdateMeetingRequest request,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var data = new UpdateMeetingData {
            Subject = request.Subject,
        };
        var result = await meetingService.UpdateMeetingAsync(userId, id, data);
        return result.Status switch {
            HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
            _ => Results.StatusCode((int)result.Status),
        };
    }

    internal static async Task<IResult> DeleteMeetingHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var result = await meetingService.DeleteMeetingAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> JoinMeetingHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromBody] JoinMeetingRequest request,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var result = await meetingService.JoinMeetingAsync(userId, id, request.JoinAs);
        return result.Status switch {
            HttpStatusCode.BadRequest => Results.ValidationProblem(result.Errors.GroupedBySource()),
            _ => Results.StatusCode((int)result.Status),
        };
    }

    internal static async Task<IResult> LeaveMeetingHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var result = await meetingService.LeaveMeetingAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> ActivateEpisodeHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromRoute] Guid episode,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var result = await meetingService.SetActiveEpisodeAsync(userId, id, episode);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> StartMeetingHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var result = await meetingService.StartMeetingAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }

    internal static async Task<IResult> StopMeetingHandler(
        HttpContext context,
        [FromRoute] Guid id,
        [FromServices] IMeetingService meetingService) {
        var userId = EndpointsMapperHelper.GetUserId(context.User);
        var result = await meetingService.StopMeetingAsync(userId, id);
        return Results.StatusCode((int)result.Status);
    }
}