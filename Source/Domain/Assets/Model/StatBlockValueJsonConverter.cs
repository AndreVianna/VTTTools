namespace VttTools.Assets.Model;

public class StatBlockValueJsonConverter : JsonConverter<StatBlockValue> {
    public override StatBlockValue Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => reader.TokenType switch {
            JsonTokenType.String => (StatBlockValue)reader.GetString()!,
            JsonTokenType.Number => (StatBlockValue)reader.GetDecimal(),
            JsonTokenType.True => (StatBlockValue)true,
            JsonTokenType.False => (StatBlockValue)false,
            _ => throw new JsonException($"Unsupported token type for StatBlockValue: {reader.TokenType}")
        };

    public override void Write(Utf8JsonWriter writer, StatBlockValue value, JsonSerializerOptions options) {
        switch (value.Value) {
            case decimal n:
                writer.WriteNumberValue(n);
                break;
            case string s:
                writer.WriteStringValue(s);
                break;
            case bool b:
                writer.WriteBooleanValue(b);
                break;
            default:
                writer.WriteNullValue();
                break;
        }
    }
}