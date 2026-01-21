using VttTools.MediaGenerator.Application.Validation;

namespace VttTools.AssetImageManager.Application.Validation;

public class InputFileValidatorTests {
    [Fact]
    public void ValidateJsonFile_WithNullPath_ReturnsFailure() {
        var result = InputFileValidator.ValidateJsonFile(null);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("InputData path cannot be empty");
    }

    [Fact]
    public void ValidateJsonFile_WithEmptyPath_ReturnsFailure() {
        var result = InputFileValidator.ValidateJsonFile(string.Empty);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("InputData path cannot be empty");
    }

    [Fact]
    public void ValidateJsonFile_WithWhitespacePath_ReturnsFailure() {
        var result = InputFileValidator.ValidateJsonFile("   ");

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("InputData path cannot be empty");
    }

    [Fact]
    public void ValidateJsonFile_WithRelativePath_ReturnsFailure() {
        var result = InputFileValidator.ValidateJsonFile("relative/path/file.json");

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("must be an absolute path");
    }

    [Fact]
    public void ValidateJsonFile_WithNonJsonExtension_ReturnsFailure() {
        var tempFile = Path.GetFullPath("test.txt");

        var result = InputFileValidator.ValidateJsonFile(tempFile);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Only .json files are supported");
    }

    [Fact]
    public void ValidateJsonFile_WithXmlExtension_ReturnsFailure() {
        var tempFile = Path.GetFullPath("test.xml");

        var result = InputFileValidator.ValidateJsonFile(tempFile);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("Only .json files are supported");
    }

    [Fact]
    public void ValidateJsonFile_WithNonExistentFile_ReturnsFailure() {
        var nonExistentPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString(), "file.json");

        var result = InputFileValidator.ValidateJsonFile(nonExistentPath);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Contain("File not found");
    }

    [Fact]
    public void ValidateJsonFile_WithValidJsonFile_ReturnsSuccess() {
        var tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.json");
        File.WriteAllText(tempFile, "{}");

        try {
            var result = InputFileValidator.ValidateJsonFile(tempFile);

            result.IsSuccessful.Should().BeTrue();
        }
        finally {
            if (File.Exists(tempFile))
                File.Delete(tempFile);
        }
    }

    [Fact]
    public void ValidateJsonFile_WithUppercaseJsonExtension_ReturnsSuccess() {
        var tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.JSON");
        File.WriteAllText(tempFile, "{}");

        try {
            var result = InputFileValidator.ValidateJsonFile(tempFile);

            result.IsSuccessful.Should().BeTrue();
        }
        finally {
            if (File.Exists(tempFile))
                File.Delete(tempFile);
        }
    }

    [Fact]
    public void ValidateJsonFile_WithMixedCaseJsonExtension_ReturnsSuccess() {
        var tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.Json");
        File.WriteAllText(tempFile, "{}");

        try {
            var result = InputFileValidator.ValidateJsonFile(tempFile);

            result.IsSuccessful.Should().BeTrue();
        }
        finally {
            if (File.Exists(tempFile))
                File.Delete(tempFile);
        }
    }
}