namespace VttTools.AI.ServiceContracts;

public sealed record GenerateManyAssetsData
    : Data {
    public IReadOnlyList<AssetGenerationData> Items { get; init; } = [];

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Items.Count == 0)
            result += new Error("At least one item is required.", nameof(Items));
        var maxItems = context?.GetValueAs<int>("MaxItemsPerBatch") ?? throw new InvalidOperationException("MaxItemsPerBatch is missing from context.");
        if (Items.Count > maxItems)
            result += new Error($"Maximum {maxItems} items per batch.", nameof(Items));

        for (var i = 0; i < Items.Count; i++) {
            var itemResult = Items[i].Validate();
            if (!itemResult.HasErrors)
                continue;
            result = itemResult.Errors.Aggregate(result, (current, error) => current + new Error($"Item[{i}]: {error.Message}", $"Items[{i}]"));
        }

        return result;
    }
}
