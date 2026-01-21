namespace VttTools.Library.Encounters.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ObjectState {
    Locked = -1,
    Closed = 0,
    Open = 1,
    Destroyed = 2,
}