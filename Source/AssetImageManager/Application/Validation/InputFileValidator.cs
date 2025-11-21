namespace VttTools.AssetImageManager.Application.Validation;

public static class InputFileValidator {
    public static ValidationResult ValidateJsonFile(string? inputPath) {
        if (string.IsNullOrWhiteSpace(inputPath)) {
            return ValidationResult.Failure("Input path cannot be empty.");
        }

        if (!Path.IsPathFullyQualified(inputPath)) {
            return ValidationResult.Failure($"Input path must be an absolute path: {inputPath}");
        }

        var extension = Path.GetExtension(inputPath).ToLowerInvariant();
        if (extension != ".json") {
            return ValidationResult.Failure($"Only .json files are supported. Got: {extension}");
        }

        if (!File.Exists(inputPath)) {
            return ValidationResult.Failure($"File not found: {inputPath}");
        }

        return ValidationResult.Success();
    }
}

public readonly record struct ValidationResult(bool IsSuccess, string? ErrorMessage) {
    public static ValidationResult Success() => new(true, null);
    public static ValidationResult Failure(string message) => new(false, message);
}
