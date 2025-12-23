namespace VttTools.Admin.Resources.EndpointMappers;

public static class ResourceApprovalEndpointsMapper {
    public static void MapResourceApprovalEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/api/admin/resources")
            .RequireAuthorization(policy => policy.RequireRole("Administrator"));

        group.MapGet("/", ResourceApprovalHandlers.ListUnpublishedHandler)
            .WithName("ListUnpublishedResources")
            .RequireRateLimiting("read");

        group.MapPost("/approve", ResourceApprovalHandlers.ApproveHandler)
            .WithName("ApproveResource")
            .RequireRateLimiting("write");

        group.MapPost("/regenerate", ResourceApprovalHandlers.RegenerateHandler)
            .WithName("RegenerateResource")
            .RequireRateLimiting("write");

        group.MapPost("/reject", ResourceApprovalHandlers.RejectHandler)
            .WithName("RejectResource")
            .RequireRateLimiting("write");

        group.MapPatch("/{id:guid}", ResourceApprovalHandlers.UpdateResourceHandler)
            .WithName("UpdateResource")
            .RequireRateLimiting("write");

        app.MapGet("/api/admin/resources/image/{id:guid}", ResourceApprovalHandlers.GetResourceImageHandler)
            .RequireAuthorization(policy => policy.RequireRole("Administrator"))
            .DisableRateLimiting()
            .WithName("GetResourceImage");
    }
}
