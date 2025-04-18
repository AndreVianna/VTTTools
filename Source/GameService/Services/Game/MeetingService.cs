﻿namespace GameService.Services.Game;

public class MeetingService(IMeetingStorage storage)
    : IMeetingService {
    public async Task<Meeting[]> GetMeetingsAsync(Guid userId, CancellationToken ct = default) {
        var data = await storage.GetByUserIdAsync(userId, ct);
        return data;
    }

    public Task<Meeting?> GetMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default)
        => storage.GetByIdAsync(meetingId, ct);

    public async Task<Result<Meeting>> CreateMeetingAsync(Guid userId, CreateMeetingData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return Result.Failure(result.Errors);

        var meeting = new Meeting {
            Name = data.Name,
            OwnerId = userId,
            Players = [new MeetingPlayer { UserId = userId, Type = PlayerType.Master }],
            // Set initial active episode
            EpisodeId = data.EpisodeId,
        };

        await storage.AddAsync(meeting, ct);
        return meeting;
    }

    public async Task<TypedResult<HttpStatusCode>> UpdateMeetingAsync(Guid userId, Guid meetingId, UpdateMeetingData data, CancellationToken ct = default) {
        var result = data.Validate();
        if (result.HasErrors)
            return TypedResult.As(HttpStatusCode.BadRequest, result.Errors);

        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        if (meeting.OwnerId != userId)
            return TypedResult.As(HttpStatusCode.Forbidden);

        meeting.Name = data.Name;
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
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

        if (meeting.Players.Any(p => p.UserId == userId))
            return TypedResult.As(HttpStatusCode.NoContent);

        meeting.Players.Add(new() { UserId = userId, Type = joinAs });
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> LeaveMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        meeting.Players.RemoveWhere(p => p.UserId == userId);
        await storage.UpdateAsync(meeting, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> SetActiveEpisodeAsync(Guid userId, Guid meetingId, Guid episodeId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = meeting.OwnerId == userId ||
                           meeting.Players.Any(p => p.UserId == userId && p.Type == PlayerType.Master);
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

        var isGameMaster = meeting.OwnerId == userId ||
                           meeting.Players.Any(p => p.UserId == userId && p.Type == PlayerType.Master);
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        // Additional meeting start logic would go here
        // For now this is just a placeholder
        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> StopMeetingAsync(Guid userId, Guid meetingId, CancellationToken ct = default) {
        var meeting = await storage.GetByIdAsync(meetingId, ct);
        if (meeting is null)
            return TypedResult.As(HttpStatusCode.NotFound);

        var isGameMaster = meeting.OwnerId == userId ||
                           meeting.Players.Any(p => p.UserId == userId && p.Type == PlayerType.Master);
        if (!isGameMaster)
            return TypedResult.As(HttpStatusCode.Forbidden);

        // Additional meeting end logic would go here
        // For now this is just a placeholder
        return TypedResult.As(HttpStatusCode.NoContent);
    }
}
