namespace VttTools.Library.Stages.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RegionType {
    Elevation = 0,
    Terrain = 1,
    Illumination = 2,
    FogOfWar = 3,
}