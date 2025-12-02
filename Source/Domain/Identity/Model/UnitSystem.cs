namespace VttTools.Identity.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UnitSystem {
    Imperial = 0,
    Metric = 1,
}
