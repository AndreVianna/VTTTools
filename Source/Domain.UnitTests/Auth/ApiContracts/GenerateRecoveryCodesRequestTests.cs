namespace VttTools.Auth.ApiContracts;

public class GenerateRecoveryCodesRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new GenerateRecoveryCodesRequest();

        // Assert
        request.Password.Should().Be(string.Empty);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new GenerateRecoveryCodesRequest {
            Password = "oldpassword",
        };

        // Act
        var updated = original with {
            Password = "newpassword",
        };

        // Assert
        updated.Password.Should().Be("newpassword");
        original.Password.Should().Be("oldpassword");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new GenerateRecoveryCodesRequest {
            Password = "password123",
        };
        var request2 = new GenerateRecoveryCodesRequest {
            Password = "password123",
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new GenerateRecoveryCodesRequest {
            Password = "password123",
        };
        var request2 = new GenerateRecoveryCodesRequest {
            Password = "differentpass",
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }
}
