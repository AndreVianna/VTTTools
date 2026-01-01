namespace VttTools.Common.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LabelPosition {
    Default = 0,
    Top = 1,
    Middle = 2,
    Bottom = 3
}