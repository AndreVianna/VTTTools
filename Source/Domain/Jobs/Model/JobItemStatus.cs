namespace VttTools.Jobs.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum JobItemStatus {
    Pending,
    InProgress,
    Success,
    Failed,
    Canceled,
}