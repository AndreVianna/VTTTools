using VttTools.Options;

namespace VttTools.Extensions;

public static class RateLimitingExtensions {
    public static IHostApplicationBuilder AddConfigurableRateLimiting(
        this IHostApplicationBuilder builder,
        params string[] policyNames) {
        builder.Services.Configure<RateLimitingOptions>(
            builder.Configuration.GetSection(RateLimitingOptions.SectionName));

        builder.Services.AddRateLimiter(options => {
            foreach (var policyName in policyNames) {
                var name = policyName;
                options.AddPolicy(name, context => {
                    var optionsMonitor = context.RequestServices.GetRequiredService<IOptionsMonitor<RateLimitingOptions>>();
                    var policyOptions = GetPolicyOptions(optionsMonitor.CurrentValue, name);
                    var partitionKey = context.User.Identity?.Name
                        ?? context.Connection.RemoteIpAddress?.ToString()
                        ?? "anonymous";

                    return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions {
                        PermitLimit = policyOptions.PermitLimit,
                        Window = TimeSpan.FromMinutes(policyOptions.WindowMinutes),
                        SegmentsPerWindow = policyOptions.SegmentsPerWindow,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = policyOptions.QueueLimit,
                    });
                });
            }

            options.OnRejected = async (context, cancellationToken) => {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Rate limit exceeded. Please try again later.", cancellationToken);
            };
        });

        return builder;
    }

    private static RateLimitPolicyOptions GetPolicyOptions(RateLimitingOptions options, string policyName)
        => policyName switch {
            "read" => options.Read,
            "write" => options.Write,
            "sensitive" => options.Sensitive,
            _ => options.Read,
        };
}
