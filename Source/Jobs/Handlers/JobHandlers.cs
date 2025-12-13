using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Jobs.Handlers;

internal static class JobHandlers {
    private static readonly string[] _error = ["Failed to retrieve created job"];

    internal static async Task<IResult> CreateJobHandler(
        [FromBody] CreateJobRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.CreateJobAsync(request, ct);

        if (!result.IsSuccessful)
            return Results.BadRequest(new { errors = result.Errors.Select(e => e.Message).ToArray() });

        var job = await jobService.GetJobByIdAsync(result.Value, ct);
        return job is null
            ? Results.BadRequest(new { errors = _error })
            : Results.Created($"/api/jobs/{result.Value}", job);
    }

    internal static async Task<IResult> GetJobByIdHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var job = await jobService.GetJobByIdAsync(id, ct);

        return job is null
            ? Results.NotFound()
            : Results.Ok(job);
    }

    internal static async Task<IResult> GetJobsHandler(
        [FromQuery] string? type,
        [FromQuery] int? skip,
        [FromQuery] int? take,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var skipValue = skip ?? 0;
        var takeValue = take ?? 20;

        var (jobs, totalCount) = await jobService.GetJobsAsync(type, skipValue, takeValue, ct);

        return Results.Ok(new {
            data = jobs,
            skip = skipValue,
            take = takeValue,
            totalCount
        });
    }

    internal static async Task<IResult> UpdateJobStatusHandler(
        [FromRoute] Guid id,
        [FromBody] UpdateJobStatusRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.UpdateJobStatusAsync(id, request, ct);

        return result.IsSuccessful
            ? Results.NoContent()
            : Results.NotFound(new { errors = result.Errors.Select(e => e.Message).ToArray() });
    }

    internal static async Task<IResult> UpdateJobCountsHandler(
        [FromRoute] Guid id,
        [FromBody] UpdateJobCountsRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.UpdateJobCountsAsync(id, request, ct);

        return result.IsSuccessful
            ? Results.NoContent()
            : Results.NotFound(new { errors = result.Errors.Select(e => e.Message).ToArray() });
    }

    internal static async Task<IResult> UpdateItemStatusHandler(
        [FromRoute] Guid id,
        [FromBody] UpdateJobItemStatusRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.UpdateItemStatusAsync(id, request, ct);

        return result.IsSuccessful
            ? Results.NoContent()
            : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message).ToArray() });
    }

    internal static async Task<IResult> BroadcastProgressHandler(
        [FromBody] BroadcastProgressRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.BroadcastProgressAsync(request, ct);

        return result.IsSuccessful
            ? Results.Ok()
            : Results.BadRequest(new { errors = result.Errors.Select(e => e.Message).ToArray() });
    }
}
