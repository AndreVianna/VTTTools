namespace VttTools.Library.Encounters.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EffectState {
    Enabled = 0,
    Disabled = 1,
    Triggered = 2,
}
