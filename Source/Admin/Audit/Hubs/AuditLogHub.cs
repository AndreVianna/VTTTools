namespace VttTools.Admin.Audit.Hubs;

[Authorize(Roles = "Administrator")]
public class AuditLogHub
    : Hub {
    public Task SubscribeToAuditLogs()
        => Groups.AddToGroupAsync(Context.ConnectionId, "all");

    public async Task UnsubscribeFromAuditLogs() {
        foreach (var group in new[] { "all" }) {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, group);
        }
    }
}

public static class AuditLogHubExtensions {
    public static Task BroadcastAuditLogAsync(this IHubContext<AuditLogHub> hubContext, AuditLog auditLog)
        => hubContext.Clients.Group("all").SendAsync("ReceiveAuditLog", auditLog);
}