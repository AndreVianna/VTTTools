namespace VttTools.Library.Encounters.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RegionType {
    Elevation = 0,
    Terrain = 1,
    Ilumination = 2,
    FogOfWar = 3,
}