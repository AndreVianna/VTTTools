namespace VttTools.AI.ServiceContracts;

public sealed record BulkAssetGenerationData : Data {
    [Required]
    public required IReadOnlyList<BulkAssetGenerationItemData> Items { get; init; }

    public Guid? TemplateId { get; init; }

    public bool GeneratePortrait { get; init; } = true;

    public bool GenerateToken { get; init; } = true;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);

        if (Items.Count == 0)
            result += new Error("At least one item is required.", nameof(Items));

        if (Items.Count > 100)
            result += new Error("Maximum 100 items per batch.", nameof(Items));

        for (var i = 0; i < Items.Count; i++) {
            var itemResult = Items[i].Validate();
            if (itemResult.HasErrors) {
                foreach (var error in itemResult.Errors)
                    result += new Error($"Item[{i}]: {error.Message}", $"Items[{i}]");
            }
        }

        return result;
    }
}
