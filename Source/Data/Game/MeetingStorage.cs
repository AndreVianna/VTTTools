﻿namespace VttTools.Data.Game;

public class MeetingStorage(ApplicationDbContext context)
    : IMeetingStorage {
    public Task<Meeting?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Meetings
            .Include(s => s.Players)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<Meeting[]> GetAllAsync(CancellationToken ct = default)
        => context.Meetings
            .Include(s => s.Players)
            .AsNoTrackingWithIdentityResolution()
            .ToArrayAsync(ct);

    public Task<Meeting[]> GetByUserIdAsync(Guid userId, CancellationToken ct = default) {
        var query = context.Meetings
                      .Include(s => s.Players)
                      .Where(s => s.OwnerId == userId || s.Players.Any(p => p.UserId == userId))
                      .AsNoTrackingWithIdentityResolution();
        return query.ToArrayAsync(ct);
    }

    public async Task AddAsync(Meeting meeting, CancellationToken ct = default) {
        await context.Meetings.AddAsync(meeting, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Meeting meeting, CancellationToken ct = default) {
        // Check if the meeting exists
        var existingMeeting = await context.Meetings
            .Include(s => s.Players)
            .FirstOrDefaultAsync(s => s.Id == meeting.Id, ct)
        ?? throw new KeyNotFoundException($"Meeting with ID {meeting.Id} not found.");

        // Detach the existing entity
        context.Entry(existingMeeting).State = EntityState.Detached;

        // Update with new entity
        context.Meetings.Update(meeting);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        var meeting = await context.Meetings
            .FirstOrDefaultAsync(s => s.Id == id, ct)
        ?? throw new KeyNotFoundException($"Meeting with ID {id} not found.");

        context.Meetings.Remove(meeting);
        await context.SaveChangesAsync(ct);
    }
}