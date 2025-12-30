using System.Text.Json;

using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Resources.Handlers;

public static class ResourceApprovalHandlers {
    public static async Task<IResult> ListUnpublishedHandler(
        [AsParameters] VttTools.Admin.Resources.ApiContracts.ResourceFilterRequest request,
        IMediaServiceClient mediaClient,
        CancellationToken ct) {
        try {
            var result = await mediaClient.ListUnpublishedResourcesAsync(request, ct);
            return result.IsSuccessful
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { errors = result.Errors });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while listing resources");
        }
    }

    public static async Task<IResult> ApproveHandler(
        HttpContext context,
        [FromBody] ApproveResourceRequest request,
        IResourceApprovalService service,
        IAuditLogService auditLogService,
        CancellationToken ct) {
        try {
            var userId = context.User.GetUserId();
            var data = new ApproveResourceData {
                ResourceId = request.ResourceId,
                AssetName = request.AssetName,
                GenerationType = request.GenerationType,
                Kind = request.Kind,
                Category = request.Category,
                Type = request.Type,
                Subtype = request.Subtype,
                Description = request.Description,
                Tags = request.Tags,
                AssetId = request.AssetId,
            };

            var result = await service.ApproveAsync(data, ct);

            if (result.IsSuccessful) {
                await auditLogService.AddAsync(new AuditLog {
                    UserId = userId,
                    Action = "Display:Approved:ByUser",
                    EntityType = "Display",
                    EntityId = request.ResourceId.ToString(),
                    Payload = JsonSerializer.Serialize(new {
                        resourceId = request.ResourceId,
                        assetId = result.Value,
                        assetName = request.AssetName,
                        generationType = request.GenerationType,
                        kind = request.Kind,
                        category = request.Category,
                        type = request.Type,
                    }, JsonDefaults.Options),
                }, ct);

                return Results.Ok(new { AssetId = result.Value });
            }

            return Results.BadRequest(new { errors = result.Errors });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while approving resource");
        }
    }

    public static async Task<IResult> RegenerateHandler(
        HttpContext context,
        [FromBody] RegenerateResourceRequest request,
        IResourceApprovalService service,
        IAuditLogService auditLogService,
        CancellationToken ct) {
        try {
            var userId = context.User.GetUserId();
            var data = new RegenerateResourceData {
                ResourceId = request.ResourceId,
                AssetName = request.AssetName,
                GenerationType = request.GenerationType,
                Kind = request.Kind,
                Category = request.Category,
                Type = request.Type,
                Description = request.Description,
            };

            var result = await service.RegenerateAsync(data, ct);

            if (result.IsSuccessful) {
                await auditLogService.AddAsync(new AuditLog {
                    UserId = userId,
                    Action = "Display:Regenerated:ByUser",
                    EntityType = "Display",
                    EntityId = request.ResourceId.ToString(),
                    Payload = JsonSerializer.Serialize(new {
                        oldResourceId = request.ResourceId,
                        newResourceId = result.Value,
                        assetName = request.AssetName,
                        generationType = request.GenerationType,
                        kind = request.Kind,
                        category = request.Category,
                        type = request.Type,
                    }, JsonDefaults.Options),
                }, ct);

                return Results.Ok(new { ResourceId = result.Value });
            }

            return Results.BadRequest(new { errors = result.Errors });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while regenerating resource");
        }
    }

    public static async Task<IResult> RejectHandler(
        HttpContext context,
        [FromBody] RejectResourceRequest request,
        IResourceApprovalService service,
        IAuditLogService auditLogService,
        CancellationToken ct) {
        try {
            var userId = context.User.GetUserId();
            var data = new RejectResourceData {
                ResourceId = request.ResourceId,
            };

            var result = await service.RejectAsync(data, ct);

            if (result.IsSuccessful) {
                await auditLogService.AddAsync(new AuditLog {
                    UserId = userId,
                    Action = "Display:Rejected:ByUser",
                    EntityType = "Display",
                    EntityId = request.ResourceId.ToString(),
                    Payload = JsonSerializer.Serialize(new {
                        resourceId = request.ResourceId,
                    }, JsonDefaults.Options),
                }, ct);

                return Results.NoContent();
            }

            return Results.BadRequest(new { errors = result.Errors });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while rejecting resource");
        }
    }

    public static async Task<IResult> GetResourceImageHandler(
        Guid id,
        IMediaServiceClient mediaClient,
        CancellationToken ct) {
        var result = await mediaClient.GetResourceDataAsync(id, ct);
        if (!result.IsSuccessful)
            return Results.NotFound();

        var (data, contentType) = result.Value;
        return Results.File(data, contentType);
    }

    public static async Task<IResult> UpdateResourceHandler(
        [FromRoute] Guid id,
        [FromBody] UpdateResourceRequest request,
        IMediaServiceClient mediaClient,
        CancellationToken ct) {
        try {
            var result = await mediaClient.UpdateResourceAsync(id, request, ct);
            return result.IsSuccessful
                ? Results.NoContent()
                : Results.BadRequest(new { errors = result.Errors });
        }
        catch (Exception) {
            return Results.Problem("An unexpected error occurred while updating resource");
        }
    }
}
