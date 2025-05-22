namespace VttTools.Utilities;

public class OptionalConverterFactoryTests {
    private readonly OptionalConverterFactory _factory = new();

    [Fact]
    public void CanConvert_WithOptionalType_ReturnsTrue() {
        // Arrange
        var type = typeof(Optional<string>);

        // Act
        var result = _factory.CanConvert(type);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CanConvert_WithNonOptionalType_ReturnsFalse() {
        // Arrange
        var type = typeof(string);

        // Act
        var result = _factory.CanConvert(type);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CreateConverter_WithOptionalType_ReturnsOptionalConverter() {
        // Arrange
        var type = typeof(Optional<string>);
        var options = new JsonSerializerOptions();

        // Act
        var converter = _factory.CreateConverter(type, options);

        // Assert
        converter.Should().NotBeNull();
        converter.Should().BeOfType<OptionalConverter<string>>();
    }

    [Fact]
    public void CreateConverter_WithOptionalOfIntType_ReturnsOptionalConverterOfInt() {
        // Arrange
        var type = typeof(Optional<int>);
        var options = new JsonSerializerOptions();

        // Act
        var converter = _factory.CreateConverter(type, options);

        // Assert
        converter.Should().NotBeNull();
        converter.Should().BeOfType<OptionalConverter<int>>();
    }
}