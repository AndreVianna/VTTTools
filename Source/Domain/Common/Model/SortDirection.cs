namespace VttTools.Common.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SortDirection {
    Ascending,
    Descending,
}
