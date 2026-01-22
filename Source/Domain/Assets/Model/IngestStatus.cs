namespace VttTools.Assets.Model;

public enum IngestStatus {
    None = 0,
    Pending = 1,
    Processing = 2,
    PartialFailure = 3,
    Failed = 4,
    PendingReview = 5,
    Approved = 6,
    Discarded = 7,
}
