namespace VttTools.Json;

public static class JsonDefaults {
    public static JsonSerializerOptions CamelCaseOptions { get; } = CreateOptions(JsonNamingPolicy.CamelCase);
    public static JsonSerializerOptions SnakeCaseOptions { get; } = CreateOptions(JsonNamingPolicy.SnakeCaseLower);
    public static JsonSerializerOptions Options => CamelCaseOptions;

    private static JsonSerializerOptions CreateOptions(JsonNamingPolicy namingPolicy) {
        var options = new JsonSerializerOptions {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = namingPolicy,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver {
                Modifiers = { OptionalPropertyModifier },
            },
        };
        options.Converters.Add(new JsonStringEnumConverter());
        options.Converters.Add(new OptionalConverterFactory());
        return options;
    }

    private static void OptionalPropertyModifier(JsonTypeInfo typeInfo) {
        if (typeInfo.Kind != JsonTypeInfoKind.Object)
            return;

        foreach (var property in typeInfo.Properties) {
            if (!IsOptionalType(property.PropertyType))
                continue;

            if (property.Get is null)
                continue;

            property.ShouldSerialize = (_, value) => value?.GetType().GetProperty("IsSet")?.GetValue(value) is true;
        }
    }

    private static bool IsOptionalType(Type type)
        => type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Optional<>);
}
