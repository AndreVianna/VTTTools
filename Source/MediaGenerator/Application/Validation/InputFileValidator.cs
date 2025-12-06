namespace VttTools.MediaGenerator.Application.Validation;

public static class InputFileValidator {
    public static Result ValidateJsonFile(string? inputPath) {
        if (string.IsNullOrWhiteSpace(inputPath))
            return Result.Failure("Input path cannot be empty.");
        if (!Path.IsPathFullyQualified(inputPath))
            return Result.Failure($"Input path must be an absolute path: {inputPath}");

        var extension = Path.GetExtension(inputPath).ToLowerInvariant();
        return extension != ".json" ? Result.Failure($"Only .json files are supported. Got: {extension}")
            : !File.Exists(inputPath) ? Result.Failure($"File not found: {inputPath}") : Result.Success();
    }
}