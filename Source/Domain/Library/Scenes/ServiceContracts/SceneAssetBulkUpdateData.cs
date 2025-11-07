namespace VttTools.Library.Scenes.ServiceContracts;

public record SceneAssetBulkUpdateData
    : Data {
    public required List<SceneAssetBulkUpdateDataItem> Updates { get; init; }

    public Result Validate() {
        if (Updates == null || Updates.Count == 0)
            return Result.Failure("Updates list cannot be empty");

        foreach (var update in Updates) {
            var result = update.Validate();
            if (result.HasErrors)
                return result;
        }

        return Result.Success();
    }
}
