using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Admin.Dashboard.Handlers;

public static class MaintenanceModeHandlers {
    public static async Task<IResult> GetMaintenanceModeStatusHandler(
        IMaintenanceModeService service,
        CancellationToken ct) {

        var maintenanceMode = await service.GetCurrentAsync(ct);

        if (maintenanceMode is null) {
            return Results.Ok(new MaintenanceModeStatusResponse {
                IsEnabled = false
            });
        }

        var response = new MaintenanceModeStatusResponse {
            Id = maintenanceMode.Id,
            IsEnabled = maintenanceMode.IsEnabled,
            Message = maintenanceMode.Message,
            ScheduledStartTime = maintenanceMode.ScheduledStartTime,
            ScheduledEndTime = maintenanceMode.ScheduledEndTime,
            EnabledAt = maintenanceMode.EnabledAt,
            EnabledBy = maintenanceMode.EnabledBy,
            DisabledAt = maintenanceMode.DisabledAt,
            DisabledBy = maintenanceMode.DisabledBy
        };

        return Results.Ok(response);
    }

    public static async Task<IResult> EnableMaintenanceModeHandler(
        EnableMaintenanceModeRequest request,
        IMaintenanceModeService service,
        ClaimsPrincipal user,
        CancellationToken ct) {

        var validationError = ValidateScheduleTimes(request.ScheduledStartTime, request.ScheduledEndTime);
        if (validationError is not null) {
            return validationError;
        }

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId)) {
            return Results.Unauthorized();
        }

        try {
            var maintenanceMode = await service.EnableAsync(
                request.Message,
                request.ScheduledStartTime,
                request.ScheduledEndTime,
                userId,
                ct);

            var response = MapToResponse(maintenanceMode);
            return Results.Ok(response);
        }
        catch (InvalidOperationException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    public static async Task<IResult> DisableMaintenanceModeHandler(
        IMaintenanceModeService service,
        ClaimsPrincipal user,
        CancellationToken ct) {

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId)) {
            return Results.Unauthorized();
        }

        try {
            var maintenanceMode = await service.DisableAsync(userId, ct);
            var response = MapToResponse(maintenanceMode);
            return Results.Ok(response);
        }
        catch (InvalidOperationException ex) {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    public static async Task<IResult> UpdateMaintenanceModeHandler(
        Guid id,
        UpdateMaintenanceModeRequest request,
        IMaintenanceModeService service,
        CancellationToken ct) {

        var validationError = ValidateScheduleTimes(request.ScheduledStartTime, request.ScheduledEndTime);
        if (validationError is not null) {
            return validationError;
        }

        try {
            var maintenanceMode = await service.UpdateAsync(
                id,
                request.Message,
                request.ScheduledStartTime,
                request.ScheduledEndTime,
                ct);

            var response = MapToResponse(maintenanceMode);
            return Results.Ok(response);
        }
        catch (InvalidOperationException ex) {
            return Results.NotFound(new { error = ex.Message });
        }
    }

    private static IResult? ValidateScheduleTimes(DateTime? scheduledStart, DateTime? scheduledEnd)
        => scheduledStart.HasValue && scheduledEnd.HasValue && scheduledEnd.Value < scheduledStart.Value
            ? Results.BadRequest(new { error = "ScheduledEndTime must be after ScheduledStartTime" })
            : null;

    private static MaintenanceModeStatusResponse MapToResponse(MaintenanceMode maintenanceMode) => new() {
        Id = maintenanceMode.Id,
        IsEnabled = maintenanceMode.IsEnabled,
        Message = maintenanceMode.Message,
        ScheduledStartTime = maintenanceMode.ScheduledStartTime,
        ScheduledEndTime = maintenanceMode.ScheduledEndTime,
        EnabledAt = maintenanceMode.EnabledAt,
        EnabledBy = maintenanceMode.EnabledBy,
        DisabledAt = maintenanceMode.DisabledAt,
        DisabledBy = maintenanceMode.DisabledBy
    };
}