namespace VttTools.Assets.Storage;

public record AdvancedSearchFilter(string Key, FilterOperator Operator, object Value) {
    public string AsText => Convert.ToString(Value) ?? string.Empty;
    public decimal AsNumber => Convert.ToDecimal(Value);
    public bool AsFlag => Convert.ToBoolean(Value);

    private static bool TryParse(string filter, out AdvancedSearchFilter result) {
        result = null!;
        var parts = filter.Split(':', 3, StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 3) return false;

        var key = parts[0];
        if (!Enum.TryParse<FilterOperator>(parts[1], true, out var op)) return false;
        var rawValue = parts[2];
        object value = decimal.TryParse(rawValue, out var num) ? num
                     : bool.TryParse(rawValue, out var b) ? b
                     : rawValue;

        result = new AdvancedSearchFilter(key, op, value);
        return true;
    }

    public static ICollection<AdvancedSearchFilter> Parse(params ICollection<string> filters) {
        if (filters is null || filters.Count == 0) return [];
        var result = new List<AdvancedSearchFilter>();
        foreach (var filter in filters) {
            if (TryParse(filter, out var parsed)) result.Add(parsed);
        }
        return result;
    }
}
