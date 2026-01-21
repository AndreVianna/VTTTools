namespace VttTools.Jobs.Authorization;

public class JobOwnerAuthorizationHandler(IJobStorage jobStorage)
    : AuthorizationHandler<JobOwnerRequirement, string> {
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        JobOwnerRequirement requirement,
        string jobId) {
        if (!Guid.TryParse(jobId, out var parsedJobId) || parsedJobId == Guid.Empty)
            return;

        var job = await jobStorage.GetByIdAsync(parsedJobId);
        if (job is null)
            return;

        try {
            var userId = context.User.GetUserId();
            if (job.OwnerId == userId)
                context.Succeed(requirement);
        }
        catch (UnauthorizedAccessException) {
            // User ID claim missing or invalid - authorization fails
        }
    }
}