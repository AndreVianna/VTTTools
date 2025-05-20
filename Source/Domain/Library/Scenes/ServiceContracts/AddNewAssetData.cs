namespace VttTools.Library.Scenes.ServiceContracts;

public record AddNewAssetData
    : CreateAssetData {
    public Vector2 Position { get; init; }
    public Vector2 Scale { get; init; }
    public float Rotation { get; init; }
    public float Elevation { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Scale is { X: < 0.1f or > 10.0f })
            result += new Error("When set, the asset horizontal scale must be between 0.1 and 10.", nameof(Scale));
        if (Scale is { Y: < 0.1f or > 10.0f })
            result += new Error("When set, the asset vertical scale must be between 0.1 and 10.", nameof(Scale));
        if (Rotation is < -180.0f or > 180.0f)
            result += new Error("When set, the asset rotation must be between -180 and 180.", nameof(Rotation));
        if (Elevation is < -1000.0f or > 1000.0f)
            result += new Error("When set, the asset elevation must be between -1000 and 1000.", nameof(Elevation));
        return result;
    }
}