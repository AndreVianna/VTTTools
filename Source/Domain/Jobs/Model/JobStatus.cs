namespace VttTools.Jobs.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum JobStatus {
    Pending,
    InProgress,
    Canceled,
    Completed,
}
