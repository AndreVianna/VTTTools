namespace VttTools.Utilities;

public class OptionalConverterTests {
    private static readonly JsonSerializerOptions _options = new();

    static OptionalConverterTests() {
        _options.Converters.Add(new OptionalConverterFactory());
    }

    [Fact]
    public void Read_DeserializesValue_ReturnsOptionalWithValue() {
        // Arrange
        const string json = """{"Value":"test"}""";

        // Act
        var result = JsonSerializer.Deserialize<TestClass>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result.Value.IsSet.Should().BeTrue();
        result.Value.Value.Should().Be("test");
    }

    [Fact]
    public void Read_DeserializesNullValue_ReturnsOptionalWithNullValue() {
        // Arrange
        const string json = """{"Value":null}""";

        // Act
        var result = JsonSerializer.Deserialize<TestClass>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result.Value.IsSet.Should().BeTrue();
        result.Value.Value.Should().BeNull();
    }

    [Fact]
    public void Read_PropertyMissing_ReturnsOptionalNone() {
        // Arrange
        const string json = "{}";

        // Act
        var result = JsonSerializer.Deserialize<TestClass>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result.Value.IsSet.Should().BeFalse();
    }

    [Fact]
    public void Write_OptionalWithValue_SerializesTheValue() {
        // Arrange
        var testObj = new TestClass { Value = Optional<string?>.Some("test") };

        // Act
        var json = JsonSerializer.Serialize(testObj, _options);

        // Assert
        json.Should().Contain("""
                              "Value":"test"
                              """);
    }

    [Fact]
    public void Write_OptionalWithNullValue_SerializesAsNull() {
        // Arrange
        var testObj = new TestClass { Value = Optional<string?>.Some(null) };

        // Act
        var json = JsonSerializer.Serialize(testObj, _options);

        // Assert
        json.Should().Contain("""
                              "Value":null
                              """);
    }

    [Fact]
    public void Write_OptionalNone_SerializesAsNull() {
        // Arrange
        var testObj = new TestClass { Value = Optional<string?>.None };

        // Act
        var json = JsonSerializer.Serialize(testObj, _options);

        // Assert
        json.Should().NotContain("""
                                 "Value":*
                                 """);
    }

    private sealed class TestClass {
        public Optional<string?> Value { get; init; }
    }
}