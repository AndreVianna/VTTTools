namespace VttTools.Options;

public sealed class RateLimitPolicyOptions {
    public int PermitLimit { get; set; }
    public int WindowMinutes { get; set; }
    public int SegmentsPerWindow { get; set; }
    public int QueueLimit { get; set; }
}