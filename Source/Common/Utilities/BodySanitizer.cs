namespace VttTools.Utilities;

public static class BodySanitizer {
    private const int _maxBodyLength = 8000;

    private static readonly HashSet<string> _sensitiveProperties = [
        "password", "pass", "pwd", "passwd",
        "token", "accesstoken", "refreshtoken", "bearertoken",
        "apikey", "api_key", "key",
        "secret", "clientsecret", "apisecret",
        "authorization", "auth"
    ];

    public static string? SanitizeRequestBody(string? body)
        => string.IsNullOrWhiteSpace(body)
            ? null
            : SanitizeBody(body);

    public static string? SanitizeResponseBody(string? body)
        => string.IsNullOrWhiteSpace(body)
            ? null
            : SanitizeBody(body);

    public static string? SanitizeQueryString(string? queryString) {
        if (string.IsNullOrWhiteSpace(queryString))
            return queryString;

        var parameters = queryString.TrimStart('?').Split('&');
        var sanitizedParameters = new List<string>();

        foreach (var parameter in parameters) {
            var parts = parameter.Split('=', 2);
            if (parts.Length != 2) {
                sanitizedParameters.Add(parameter);
                continue;
            }

            var key = parts[0];
            var isSensitive = _sensitiveProperties.Contains(key.ToLowerInvariant());

            sanitizedParameters.Add(isSensitive
                ? $"{key}=***REDACTED***"
                : parameter);
        }

        var result = string.Join("&", sanitizedParameters);
        return result.Length > _maxBodyLength
            ? result[.._maxBodyLength] + "... [truncated]"
            : result;
    }

    private static string SanitizeBody(string body) {
        try {
            using var doc = JsonDocument.Parse(body);
            var sanitized = SanitizeElement(doc.RootElement);
            var json = JsonSerializer.Serialize(sanitized);

            return json.Length > _maxBodyLength
                ? json[.._maxBodyLength] + "... [truncated]"
                : json;
        }
        catch {
            return body.Length > _maxBodyLength
                ? body[.._maxBodyLength] + "... [truncated]"
                : body;
        }
    }

    private static object? SanitizeElement(JsonElement element) => element.ValueKind switch {
        JsonValueKind.Object => SanitizeObject(element),
        JsonValueKind.Array => SanitizeArray(element),
        JsonValueKind.String => element.GetString(),
        JsonValueKind.Number => element.GetRawText(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        JsonValueKind.Null => null,
        _ => element.GetRawText()
    };

    private static Dictionary<string, object?> SanitizeObject(JsonElement element) {
        var result = new Dictionary<string, object?>();

        foreach (var property in element.EnumerateObject()) {
            var propertyName = property.Name;
            var isSensitive = _sensitiveProperties.Contains(propertyName.ToLowerInvariant());

            result[propertyName] = isSensitive
                ? "***REDACTED***"
                : SanitizeElement(property.Value);
        }

        return result;
    }

    private static List<object?> SanitizeArray(JsonElement element) {
        var result = new List<object?>();

        foreach (var item in element.EnumerateArray()) {
            result.Add(SanitizeElement(item));
        }

        return result;
    }
}
