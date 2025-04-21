// ReSharper disable once CheckNamespace
namespace VttTools.GameService.Endpoints;

internal static class MeetingEndpointsMapper {
    public static void MapMeetingEndpoints(this IEndpointRouteBuilder app) {
        var meetings = app.MapGroup("/api/meetings")
                          .RequireAuthorization();

        meetings.MapGet("/", MeetingHandlers.GetMeetingsHandler);
        meetings.MapGet("/{id:guid}", MeetingHandlers.GetMeetingByIdHandler);
        meetings.MapPost("/", MeetingHandlers.CreateMeetingHandler);
        meetings.MapPatch("/{id:guid}", MeetingHandlers.UpdateMeetingHandler);
        meetings.MapDelete("/{id:guid}", MeetingHandlers.DeleteMeetingHandler);
        meetings.MapPost("/{id:guid}/join", MeetingHandlers.JoinMeetingHandler);
        meetings.MapPost("/{id:guid}/leave", MeetingHandlers.LeaveMeetingHandler);
        meetings.MapPost("/{id:guid}/episodes/{episode:guid}/activate", MeetingHandlers.ActivateEpisodeHandler);
        meetings.MapPost("/{id:guid}/start", MeetingHandlers.StartMeetingHandler);
        meetings.MapPost("/{id:guid}/stop", MeetingHandlers.StopMeetingHandler);
    }
}