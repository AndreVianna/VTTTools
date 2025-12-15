namespace VttTools.Jobs.Model;

public class JobProcessingOptions {
    public const string SectionName = "Jobs";

    public int MaxConcurrentJobs { get; set; } = 1;
    public int MaxItemsPerBatch { get; set; } = 100;
    public int DelayBetweenItemsMs { get; set; } = 1000;
}
