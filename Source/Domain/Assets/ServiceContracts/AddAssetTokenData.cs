namespace VttTools.Assets.ServiceContracts;

public record AddAssetTokenData
    : Data {
    public string? Description { get; init; }
    public string[] Tags { get; init; } = [];
    public Guid? TokenId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (Description?.Length > 1024)
            result += new Error("The token description cannot have more than 1024 characters.", nameof(Description));

        return result;
    }
}