namespace VttTools.Common.Options;

public sealed class RateLimitingOptions {
    public const string SectionName = "RateLimiting";

    public RateLimitPolicyOptions Read { get; set; } = new() {
        PermitLimit = 200,
        WindowMinutes = 1,
        SegmentsPerWindow = 6,
        QueueLimit = 10,
    };

    public RateLimitPolicyOptions Write { get; set; } = new() {
        PermitLimit = 50,
        WindowMinutes = 1,
        SegmentsPerWindow = 6,
        QueueLimit = 5,
    };

    public RateLimitPolicyOptions Sensitive { get; set; } = new() {
        PermitLimit = 5,
        WindowMinutes = 1,
        SegmentsPerWindow = 2,
        QueueLimit = 0,
    };
}

public sealed class RateLimitPolicyOptions {
    public int PermitLimit { get; set; }
    public int WindowMinutes { get; set; }
    public int SegmentsPerWindow { get; set; }
    public int QueueLimit { get; set; }
}
