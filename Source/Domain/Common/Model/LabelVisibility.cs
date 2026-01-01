namespace VttTools.Common.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LabelVisibility {
    Default = 0,
    Always = 1,
    OnHover = 2,
    Never = 3
}