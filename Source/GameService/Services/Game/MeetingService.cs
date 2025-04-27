namespace VttTools.GameService.Services.Game;

public class MeetingService(IMeetingStorage storage)
    : IMeetingService {
    public Task<Meeting[]> GetMeetingsAsync(Guid userId, CancellationToken ct = default)
        => storage.GetByUserIdAsync(userId, ct);

    public Task<Meeting?> GetMeetingByIdAsync(Guid userId, Guid meetingId, CancellationToken ct = default)
        => storage.GetByIdAsync(meetingId, ct);

    public async Task<TypedResult<HttpStatusCode, Meeting>> CreateMeetingAsync(Guid userId, CreateMeetingData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors]).WithNo<Meeting>();

        var meeting = new Meeting {
            Subject = data.Subject,
            OwnerId = userId,
            Players = [new MeetingPlayer { UserId = userId, Type = PlayerType.Master }],
            EpisodeId = data.EpisodeId,
        };

        await storage.AddAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.Created, meeting);
    }

    public async Task<TypedResult<HttpStatusCode, Meeting>> UpdateMeetingAsync(Guid userId, Guid meetingId, UpdateMeetingData data, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound).WithNo<Meeting>();

        if (meeting.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden).WithNo<Meeting>();

        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors]).WithNo<Meeting>();

        if (data.Subject.IsSet)
            meeting.Subject = data.Subject.Value;
        if (data.EpisodeId.IsSet)
            meeting.EpisodeId = data.EpisodeId.Value;
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.OK, meeting);
    }

    public async Task<TypedResult<HttpStatusCode>> DeleteMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (meeting.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden);

        await storage.DeleteAsync(meetingId, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> JoinMeetingAsync(Guid userId, Guid meetingId, PlayerType joinAs, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (meeting.Players.Any(p => IsInMeeting(p, userId)))
            return TypedResult.As(HttpStatusCode.NoContent);

        meeting.Players.Add(new() { UserId = userId, Type = joinAs });
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> LeaveMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        meeting.Players.RemoveWhere(p => IsInMeeting(p, userId));
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> SetActiveEpisodeAsync(Guid userId, Guid meetingId, Guid episodeId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = meeting.Players.Any(p => IsMeetingGameMaster(p, userId));
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        meeting.EpisodeId = episodeId;
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StartMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = meeting.Players.Any(p => IsMeetingGameMaster(p, userId));
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        meeting.Status = MeetingStatus.InProgress;
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StopMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = meeting.Players.Any(p => IsMeetingGameMaster(p, userId));
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        meeting.Status = MeetingStatus.Finished;
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    private static bool IsInMeeting(MeetingPlayer player, Guid userId)
        => player.UserId == userId;
    private static bool IsMeetingGameMaster(MeetingPlayer player, Guid userId)
        => IsInMeeting(player, userId) && player.Type == PlayerType.Master;
}