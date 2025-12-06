namespace VttTools.Admin.Hubs;

[Authorize(Roles = "Administrator")]
public class AuditLogHub : Hub {
    public async Task SubscribeToAuditLogs()
        => await Groups.AddToGroupAsync(Context.ConnectionId, "all");

    public async Task UnsubscribeFromAuditLogs() {
        foreach (var group in new[] { "all" }) {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, group);
        }
    }
}

public static class AuditLogHubExtensions {
    public static async Task BroadcastAuditLogAsync(this IHubContext<AuditLogHub> hubContext, AuditLog auditLog)
        => await hubContext.Clients.Group("all").SendAsync("ReceiveAuditLog", auditLog);
}