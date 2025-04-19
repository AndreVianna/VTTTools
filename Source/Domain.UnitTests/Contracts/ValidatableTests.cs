namespace VttTools.Contracts;

public class ValidatableTests {
    [Fact]
    public void Request_WhenValidated_ReturnsSuccess() {
        // Arrange
        var request = new TestRequest();

        // Act
        var result = request.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    [Fact]
    public void Data_WhenValidated_ReturnsSuccess() {
        // Arrange
        var data = new TestData();

        // Act
        var result = data.Validate();

        // Assert
        result.HasErrors.Should().BeFalse();
    }

    // Test helper classes
    private sealed record TestRequest() : Request();

    private sealed record TestData() : Data();
}