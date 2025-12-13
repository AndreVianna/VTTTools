namespace VttTools.Jobs.EndpointMappers;

internal static class JobEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Job CRUD operations and status updates.
    /// </summary>
    public static void MapJobEndpoints(this IEndpointRouteBuilder app) {
        var jobs = app.MapGroup("/api/jobs").RequireAuthorization();

        jobs.MapPost("/", JobHandlers.CreateJobHandler);
        jobs.MapGet("/", JobHandlers.GetJobsHandler);
        jobs.MapGet("/{id:guid}", JobHandlers.GetJobByIdHandler);
        jobs.MapPatch("/{id:guid}/status", JobHandlers.UpdateJobStatusHandler);
        jobs.MapPatch("/{id:guid}/counts", JobHandlers.UpdateJobCountsHandler);
        jobs.MapPatch("/items/{id:guid}/status", JobHandlers.UpdateItemStatusHandler);
        jobs.MapPost("/progress", JobHandlers.BroadcastProgressHandler);
    }
}
