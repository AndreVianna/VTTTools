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
        jobs.MapDelete("/{id:guid}", JobHandlers.CancelJobHandler);
        jobs.MapPost("/{id:guid}/retry", JobHandlers.RetryJobHandler);
        jobs.MapGet("/{id:guid}/items", JobHandlers.GetJobItemsHandler);
        jobs.MapPatch("/{id:guid}/items/{index:int}", JobHandlers.UpdateItemStatusHandler);
        jobs.MapPost("/progress", JobHandlers.BroadcastProgressHandler);
    }
}
