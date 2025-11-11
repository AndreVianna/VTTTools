namespace VttTools.Library.Encounters.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GridType {
    NoGrid,
    Square,
    HexV, // Vertically aligned hexagon
    HexH, // Horizontally aligned hexagon
    Isometric,
}