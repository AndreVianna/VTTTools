namespace VttTools.Jobs.EndpointMappers;

internal static class JobEndpointsMapper {
    /// <summary>
    /// Maps endpoints for Job CRUD operations and status updates.
    /// </summary>
    public static void MapJobEndpoints(this IEndpointRouteBuilder app) {
        var jobs = app.MapGroup("/api/jobs").RequireAuthorization();

        jobs.MapPost("/", JobHandlers.AddJobHandler);
        jobs.MapGet("/", JobHandlers.GetJobsHandler);
        jobs.MapGet("/{id:guid}", JobHandlers.GetJobByIdHandler);
        jobs.MapPatch("/{id:guid}", JobHandlers.UpdateJobHandler);
        jobs.MapDelete("/{id:guid}", JobHandlers.CancelJobHandler);
        jobs.MapPost("/{id:guid}/retry", JobHandlers.RetryJobHandler);
    }
}
