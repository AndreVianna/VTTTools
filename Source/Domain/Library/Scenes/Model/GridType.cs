namespace VttTools.Library.Scenes.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GridType {
    NoGrid,
    Square,
    HexV, // Vertically aligned hexagon
    HexH, // Horizontally aligned hexagon
    Isometric,
}