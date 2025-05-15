namespace VttTools.Library.Scenes.ServiceContracts;

public record AddNewAssetData
    : CreateAssetData {
    public double Scale { get; init; } = 1.0d;
    public Position Position { get; init; } = new();

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Scale is  < 0.1d or > 10.0d)
            result += new Error("The asset scale must be between 0.1 and 10.", nameof(Scale));
        return result;
    }
}