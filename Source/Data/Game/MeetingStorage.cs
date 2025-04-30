namespace VttTools.Data.Game;

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

    public async Task<Meeting> AddAsync(Meeting meeting, CancellationToken ct = default) {
        await context.Meetings.AddAsync(meeting, ct);
        await context.SaveChangesAsync(ct);
        return meeting;
    }

    public async Task<Meeting?> UpdateAsync(Meeting meeting, CancellationToken ct = default) {
        context.Meetings.Update(meeting);
        var result = await context.SaveChangesAsync(ct);
        return result > 0 ? meeting : null;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default) {
        var meeting = await context.Meetings.FindAsync([id], ct);
        if (meeting == null)
            return false;
        context.Meetings.Remove(meeting);
        var result = await context.SaveChangesAsync(ct);
        return result > 0;
    }
}