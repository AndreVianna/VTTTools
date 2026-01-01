namespace VttTools.Common.Model;

public record NamedSize() {
    private const double _tolerance = 0.001;

    public static NamedSize Default => new(SizeName.Medium);

    public static NamedSize Zero => new(SizeName.Zero);

    public NamedSize(double size)
        : this(size, size) {
    }

    public NamedSize(double width, double height)
        : this() {
        Width = Math.Round(width, 3);
        Height = Math.Round(height, 3);
    }

    public NamedSize(SizeName name)
        : this() {
        Name = name;
    }

    public double Width { get; init; }
    public double Height { get; init; }

    public SizeName Name {
        get => FromSize(Width, Height);
        init => (Width, Height) = FromName(value);
    }

    private static SizeName FromSize(double width, double height)
        => Math.Abs(width - height) > _tolerance ? SizeName.Custom
         : Math.Abs(width) <= _tolerance ? SizeName.Zero
         : Math.Abs(width - 0.25) <= _tolerance ? SizeName.Tiny
         : Math.Abs(width - 0.5) <= _tolerance ? SizeName.Small
         : Math.Abs(width - 1.0) <= _tolerance ? SizeName.Medium
         : Math.Abs(width - 2.0) <= _tolerance ? SizeName.Large
         : Math.Abs(width - 3.0) <= _tolerance ? SizeName.Huge
         : Math.Abs(width - 4.0) <= _tolerance ? SizeName.Gargantuan
         : SizeName.Custom;

    private static (double, double) FromName(SizeName name)
        => name switch {
            SizeName.Zero => (0.0, 0.0),
            SizeName.Tiny => (0.25, 0.25),
            SizeName.Small => (0.5, 0.5),
            SizeName.Medium => (1, 1),
            SizeName.Large => (2, 2),
            SizeName.Huge => (3, 3),
            SizeName.Gargantuan => (4, 4),
            _ => (1, 1)
        };
}