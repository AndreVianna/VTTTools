using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Jobs.Handlers;

internal static class JobHandlers {
    internal static async Task<IResult> CreateJobHandler(
        [FromBody] CreateJobRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.CreateJobAsync(request, ct);

        if (!result.IsSuccessful)
            return Results.BadRequest(new { errors = result.Errors.Select(e => e.Message).ToArray() });

        var job = await jobService.GetJobByIdAsync(result.Value, ct);
        return job is null
            ? Results.Problem(detail: "Failed to retrieve created job", statusCode: 500)
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

        (var jobs, var totalCount) = await jobService.GetJobsAsync(type, skipValue, takeValue, ct);

        return Results.Ok(new {
            data = jobs,
            skip = skipValue,
            take = takeValue,
            totalCount
        });
    }

    internal static async Task<IResult> CancelJobHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.CancelJobAsync(id, ct);

        return result.IsSuccessful
            ? Results.NoContent()
            : Results.NotFound(new { errors = result.Errors.Select(e => e.Message).ToArray() });
    }

    internal static async Task<IResult> RetryJobHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.RetryJobAsync(id, ct);

        return result.IsSuccessful
            ? Results.NoContent()
            : Results.NotFound(new { errors = result.Errors.Select(e => e.Message).ToArray() });
    }

    internal static async Task<IResult> GetJobItemsHandler(
        [FromRoute] Guid id,
        [FromQuery] JobItemStatus? status,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var items = await jobService.GetJobItemsAsync(id, status, ct);

        return Results.Ok(items);
    }

    internal static async Task<IResult> UpdateItemStatusHandler(
        [FromRoute] Guid id,
        [FromRoute] int index,
        [FromBody] UpdateJobItemStatusRequest request,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var result = await jobService.UpdateItemStatusAsync(id, index, request, ct);

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
