namespace VttTools.Utilities;

public class OptionalTests {
    [Fact]
    public void None_WhenAccessed_ReturnsUnsetOptional() {
        // Arrange & Act
        var optional = Optional<string>.None;

        // Assert
        optional.IsSet.Should().BeFalse();
    }

    [Fact]
    public void Some_WithValue_ReturnsSetOptional() {
        // Arrange & Act
        var optional = Optional<string>.Some("test");

        // Assert
        optional.IsSet.Should().BeTrue();
        optional.Value.Should().Be("test");
    }

    [Fact]
    public void Some_WithNullValue_ReturnsSetOptionalWithNull() {
        // Arrange & Act
        var optional = Optional<string?>.Some(null);

        // Assert
        optional.IsSet.Should().BeTrue();
        optional.Value.Should().BeNull();
    }

    [Fact]
    public void ImplicitConversion_FromValue_ReturnsSome() {
        // Arrange
        const string value = "test";

        // Act
        Optional<string> optional = value;

        // Assert
        optional.IsSet.Should().BeTrue();
        optional.Value.Should().Be(value);
    }

    [Fact]
    public void ImplicitConversion_FromNull_ReturnsSomeWithNull() {
        // Arrange & Act
        Optional<string?> optional = null;

        // Assert
        optional.IsSet.Should().BeTrue();
        optional.Value.Should().BeNull();
    }

    [Fact]
    public void Value_WhenSet_ReturnsValue() {
        // Arrange
        var optional = Optional<int>.Some(42);

        // Act
        var value = optional.Value;

        // Assert
        value.Should().Be(42);
    }

    [Fact]
    public void Value_WhenNotSet_ThrowsInvalidOperationException() {
        // Arrange
        var optional = Optional<int>.None;

        // Act & Assert
        optional.Invoking(o => o.Value)
               .Should().Throw<InvalidOperationException>()
               .WithMessage("Value is not set.");
    }

    [Fact]
    public void GetValueOrDefault_WhenSet_ReturnsValue() {
        // Arrange
        var optional = Optional<int>.Some(42);

        // Act
        var value = optional.GetValueOrDefault();

        // Assert
        value.Should().Be(42);
    }

    [Fact]
    public void GetValueOrDefault_WhenNotSet_ReturnsDefaultValue() {
        // Arrange
        var optional = Optional<int>.None;

        // Act
        var value = optional.GetValueOrDefault();

        // Assert
        value.Should().Be(default);
    }

    [Fact]
    public void GetValueOrDefault_WhenNotSet_ReturnsProvidedDefaultValue() {
        // Arrange
        var optional = Optional<int>.None;

        // Act
        var value = optional.GetValueOrDefault(100);

        // Assert
        value.Should().Be(100);
    }

    [Fact]
    public void Equals_BothNone_ReturnsTrue() {
        // Arrange
        var optional1 = Optional<string>.None;
        var optional2 = Optional<string>.None;

        // Act & Assert
        optional1.Should().Be(optional2);
    }

    [Fact]
    public void Equals_BothSomeWithSameValue_ReturnsTrue() {
        // Arrange
        var optional1 = Optional<string>.Some("test");
        var optional2 = Optional<string>.Some("test");

        // Act & Assert
        optional1.Should().Be(optional2);
    }

    [Fact]
    public void Equals_BothSomeWithDifferentValues_ReturnsFalse() {
        // Arrange
        var optional1 = Optional<string>.Some("test1");
        var optional2 = Optional<string>.Some("test2");

        // Act & Assert
        optional1.Should().NotBe(optional2);
    }

    [Fact]
    public void Equals_OneNoneOneSome_ReturnsFalse() {
        // Arrange
        var optional1 = Optional<string>.None;
        var optional2 = Optional<string>.Some("test");

        // Act & Assert
        optional1.Should().NotBe(optional2);
        optional2.Should().NotBe(optional1);
    }

    [Fact]
    public void Equals_BothSomeWithNullValue_ReturnsTrue() {
        // Arrange
        var optional1 = Optional<string?>.Some(null);
        var optional2 = Optional<string?>.Some(null);

        // Act & Assert
        optional1.Should().Be(optional2);
    }

    [Fact]
    public void GetHashCode_None_ReturnsConsistentValue() {
        // Arrange
        var optional1 = Optional<string>.None;
        var optional2 = Optional<string>.None;

        // Act
        var hashCode1 = optional1.GetHashCode();
        var hashCode2 = optional2.GetHashCode();

        // Assert
        hashCode1.Should().Be(hashCode2);
    }

    [Fact]
    public void GetHashCode_SomeWithSameValue_ReturnsConsistentValue() {
        // Arrange
        var optional1 = Optional<string>.Some("test");
        var optional2 = Optional<string>.Some("test");

        // Act
        var hashCode1 = optional1.GetHashCode();
        var hashCode2 = optional2.GetHashCode();

        // Assert
        hashCode1.Should().Be(hashCode2);
    }

    [Fact]
    public void GetHashCode_SomeWithDifferentValues_ReturnsDifferentValues() {
        // Arrange
        var optional1 = Optional<string>.Some("test1");
        var optional2 = Optional<string>.Some("test2");

        // Act
        var hashCode1 = optional1.GetHashCode();
        var hashCode2 = optional2.GetHashCode();

        // Assert
        hashCode1.Should().NotBe(hashCode2);
    }

    [Fact]
    public void ToString_None_ReturnsNoneString() {
        // Arrange
        var optional = Optional<string>.None;

        // Act
        var result = optional.ToString();

        // Assert
        result.Should().Be("None");
    }

    [Fact]
    public void ToString_SomeWithValue_ReturnsSomeWithValueString() {
        // Arrange
        var optional = Optional<string>.Some("test");

        // Act
        var result = optional.ToString();

        // Assert
        result.Should().Be("Some(test)");
    }

    [Fact]
    public void ToString_SomeWithNullValue_ReturnsSomeWithNullString() {
        // Arrange
        var optional = Optional<string?>.Some(null);

        // Act
        var result = optional.ToString();

        // Assert
        result.Should().Be("Some(null)");
    }

    [Fact]
    public void Optional_WithValueType_WorksCorrectly() {
        // Arrange
        var optional = Optional<int>.Some(42);

        // Act & Assert
        optional.IsSet.Should().BeTrue();
        optional.Value.Should().Be(42);
    }

    [Fact]
    public void Optional_WithReferenceType_WorksCorrectly() {
        // Arrange
        var obj = new object();
        var optional = Optional<object>.Some(obj);

        // Act & Assert
        optional.IsSet.Should().BeTrue();
        optional.Value.Should().BeSameAs(obj);
    }
}