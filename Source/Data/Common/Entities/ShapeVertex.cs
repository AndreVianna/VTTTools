namespace VttTools.Data.Common.Entities;

public class ShapeVertex {
    public Guid ShapeId { get; set; }

    public ushort Index { get; set; }

    public double X { get; set; }

    public double Y { get; set; }

    public Shape Shape { get; set; } = null!;
}