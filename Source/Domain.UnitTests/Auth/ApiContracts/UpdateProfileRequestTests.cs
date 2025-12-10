namespace VttTools.Auth.ApiContracts;

public class UpdateProfileRequestTests {
    [Fact]
    public void Constructor_WhenCalled_InitializesWithDefaultValues() {
        // Arrange & Act
        var request = new UpdateProfileRequest();

        // Assert
        request.Name.Should().BeNull();
        request.DisplayName.Should().BeNull();
        request.Email.Should().BeNull();
        request.PhoneNumber.Should().BeNull();
        request.PreferredUnitSystem.Should().BeNull();
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var original = new UpdateProfileRequest {
            Name = "Old Name",
            DisplayName = "OldDisplay",
            Email = "old@example.com",
            PhoneNumber = "555-0100",
            PreferredUnitSystem = UnitSystem.Imperial,
        };

        // Act
        var updated = original with {
            Name = "New Name",
            DisplayName = "NewDisplay",
            Email = "new@example.com",
            PhoneNumber = "555-0200",
            PreferredUnitSystem = UnitSystem.Metric,
        };

        // Assert
        updated.Name.Should().Be("New Name");
        updated.DisplayName.Should().Be("NewDisplay");
        updated.Email.Should().Be("new@example.com");
        updated.PhoneNumber.Should().Be("555-0200");
        updated.PreferredUnitSystem.Should().Be(UnitSystem.Metric);
        original.Name.Should().Be("Old Name");
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var request1 = new UpdateProfileRequest {
            Name = "Test User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            PhoneNumber = "555-0100",
            PreferredUnitSystem = UnitSystem.Metric,
        };
        var request2 = new UpdateProfileRequest {
            Name = "Test User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            PhoneNumber = "555-0100",
            PreferredUnitSystem = UnitSystem.Metric,
        };

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var request1 = new UpdateProfileRequest {
            Name = "Test User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            PhoneNumber = "555-0100",
            PreferredUnitSystem = UnitSystem.Metric,
        };
        var request2 = new UpdateProfileRequest {
            Name = "Different User",
            DisplayName = "TestDisplay",
            Email = "test@example.com",
            PhoneNumber = "555-0100",
            PreferredUnitSystem = UnitSystem.Metric,
        };

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }

    [Fact]
    public void Properties_WithNullValues_AcceptsNull() {
        // Arrange & Act
        var request = new UpdateProfileRequest {
            Name = null,
            DisplayName = null,
            Email = null,
            PhoneNumber = null,
            PreferredUnitSystem = null,
        };

        // Assert
        request.Name.Should().BeNull();
        request.DisplayName.Should().BeNull();
        request.Email.Should().BeNull();
        request.PhoneNumber.Should().BeNull();
        request.PreferredUnitSystem.Should().BeNull();
    }
}
