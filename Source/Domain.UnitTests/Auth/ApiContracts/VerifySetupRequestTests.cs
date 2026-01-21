namespace VttTools.Auth.ApiContracts;

public class VerifySetupRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new VerifySetupRequest();

        // Assert
        request.Code.Should().Be(string.Empty);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new VerifySetupRequest {
            Code = "123456",
        };

        // Act
        var updated = original with {
            Code = "654321",
        };

        // Assert
        updated.Code.Should().Be("654321");
        original.Code.Should().Be("123456");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new VerifySetupRequest {
            Code = "123456",
        };
        var request2 = new VerifySetupRequest {
            Code = "123456",
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new VerifySetupRequest {
            Code = "123456",
        };
        var request2 = new VerifySetupRequest {
            Code = "654321",
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }
}