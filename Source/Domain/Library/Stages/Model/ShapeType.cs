namespace VttTools.Library.Stages.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ShapeType {
    Circle = 0,
    Rectangle = 1,
    Cone = 2,
    Line = 3,
    Polygon = 4,
}
