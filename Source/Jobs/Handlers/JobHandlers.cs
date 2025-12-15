using IResult = Microsoft.AspNetCore.Http.IResult;

namespace VttTools.Jobs.Handlers;

internal static class JobHandlers {
    internal static async Task<IResult> AddJobHandler([FromBody] AddJobRequest request, [FromServices] IJobService jobService, CancellationToken ct) {
        var data = new AddJobData {
            Type = request.Type,
            Items = request.Items.ConvertAll(i => new AddJobData.Item() {
                Index = i.Index,
                Data = i.Data,
            }),
        };
        var result = await jobService.AddAsync(data, ct);

        return result.IsSuccessful
                   ? Results.Created($"/api/jobs/{result.Value.Id}", result.Value)
                   : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> UpdateJobHandler([FromRoute] Guid id, [FromBody] UpdateJobRequest request, [FromServices] IJobService jobService, CancellationToken ct) {
        var data = new UpdateJobData {
            Id = id,
            CompletedAt = request.CompletedAt,
            Status = request.Status,
            StartedAt = request.StartedAt,
            Items = request.Items.ConvertAll(i => new UpdateJobData.Item() {
                Index = i.Index,
                Status = i.Status,
                Message = i.Message,
                StartedAt = i.StartedAt,
                CompletedAt = i.CompletedAt,
            }),
        };
        var result = await jobService.UpdateAsync(data, ct);

        return result.IsSuccessful
                   ? Results.NoContent()
                   : Results.BadRequest(result.Errors);
    }

    internal static async Task<IResult> GetJobByIdHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var job = await jobService.GetByIdAsync(id, ct);

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

        (var jobs, var totalCount) = await jobService.SearchAsync(type, skipValue, takeValue, ct);

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
        var isSuccess = await jobService.CancelAsync(id, ct);

        return isSuccess
            ? Results.NoContent()
            : Results.NotFound();
    }

    internal static async Task<IResult> RetryJobHandler(
        [FromRoute] Guid id,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        var isSuccess = await jobService.RetryAsync(id, ct);

        return isSuccess
            ? Results.NoContent()
            : Results.NotFound();
    }

    internal static async Task<IResult> BroadcastItemUpdateHandler(
        [FromBody] JobItemUpdateEvent @event,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        await jobService.BroadcastItemUpdateAsync(@event, ct);
        return Results.NoContent();
    }

    internal static async Task<IResult> BroadcastProgressHandler(
        [FromBody] JobProgressEvent @event,
        [FromServices] IJobService jobService,
        CancellationToken ct) {
        await jobService.BroadcastProgressAsync(@event, ct);
        return Results.NoContent();
    }
}
