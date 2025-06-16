namespace VttTools.Utilities;

/// <summary>
/// JsonConverter for the Optional&lt;T&gt; type.
/// Handles deserialization based on property presence and serializes appropriately.
/// </summary>
/// <typeparam name="T">The underlying type of the Optional.</typeparam>
internal sealed class OptionalConverter<T> : JsonConverter<Optional<T>> {
    /// <summary>
    /// Reads the JSON and deserializes it into an Optional&lt;T&gt;.
    /// This method is only called if the property *exists* in the JSON payload.
    /// If the property is missing, the default Optional&lt;T&gt; (NoGrid) will be used.
    /// </summary>
    public override Optional<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        // If Read is called, the property was present in the JSON.
        // Deserialize the inner value (which might be null).
        var value = JsonSerializer.Deserialize<T>(ref reader, options);

        // Return an Optional representing a value that was explicitly set.
        return Optional<T>.Some(value!);
    }

    /// <summary>
    /// Writes the Optional value to JSON.
    /// If IsSet is true, writes the inner Value.
    /// If IsSet is false, writes null (as omitting requires higher-level handling).
    /// </summary>
    public override void Write(Utf8JsonWriter writer, Optional<T> optionalValue, JsonSerializerOptions options) {
        if (optionalValue.IsSet) {
            // Serialize the actual value if it's present
            JsonSerializer.Serialize(writer, optionalValue.Value, options);
        }
    }
}
