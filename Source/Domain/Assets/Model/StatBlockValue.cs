namespace VttTools.Assets.Model;

[JsonConverter(typeof(StatBlockValueJsonConverter))]
public readonly record struct StatBlockValue {
    private readonly string? _text;
    private readonly decimal? _number;
    private readonly bool? _flag;

    public string Text => _text ?? throw new InvalidCastException("The value is not a text.");
    public decimal Number => _number ?? throw new InvalidCastException("The value is not a number.");
    public bool Flag => _flag ?? throw new InvalidCastException("The value is not a flag.");

    public bool IsNumber => _number.HasValue;
    public bool IsFlag => _flag.HasValue;
    public bool IsText => _text is not null;

    public static implicit operator StatBlockValue(int v) => new(null, v, null);
    public static implicit operator StatBlockValue(float v) => new(null, (decimal)v, null);
    public static implicit operator StatBlockValue(decimal v) => new(null, v, null);
    public static implicit operator StatBlockValue(double v) => new(null, (decimal)v, null);
    public static implicit operator StatBlockValue(string v) => new(v, null, null);
    public static implicit operator StatBlockValue(bool v) => new(null, null, v);

    public StatBlockValue(string? t, decimal? n, bool? f) { _text = t; _number = n; _flag = f; }

    public object? Value => (object?)_text ?? (object?)_number ?? _flag;
}
