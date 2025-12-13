namespace VttTools.Identity.Model;

public class BasicUserInfoTests {
    [Fact]
    public void Constructor_WithRequiredProperties_InitializesCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();

        // Act
        var userInfo = new BasicUserInfo {
            Id = id,
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
        };

        // Assert
        userInfo.Id.Should().Be(id);
        userInfo.DisplayName.Should().Be("John Doe");
        userInfo.Email.Should().Be("john.doe@example.com");
        userInfo.IsAdministrator.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithIsAdministrator_InitializesCorrectly() {
        // Arrange
        var id = Guid.CreateVersion7();

        // Act
        var userInfo = new BasicUserInfo {
            Id = id,
            DisplayName = "Admin User",
            Email = "admin@example.com",
            IsAdministrator = true,
        };

        // Assert
        userInfo.IsAdministrator.Should().BeTrue();
    }

    [Fact]
    public void WithClause_WithChangedDisplayName_UpdatesProperty() {
        // Arrange
        var original = new BasicUserInfo {
            Id = Guid.CreateVersion7(),
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
        };

        // Act
        var updated = original with { DisplayName = "Jane Doe" };

        // Assert
        updated.DisplayName.Should().Be("Jane Doe");
        original.DisplayName.Should().Be("John Doe");
    }

    [Fact]
    public void WithClause_WithChangedEmail_UpdatesProperty() {
        // Arrange
        var original = new BasicUserInfo {
            Id = Guid.CreateVersion7(),
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
        };

        // Act
        var updated = original with { Email = "jane.doe@example.com" };

        // Assert
        updated.Email.Should().Be("jane.doe@example.com");
        original.Email.Should().Be("john.doe@example.com");
    }

    [Fact]
    public void IsAdministrator_CanBeChanged() {
        // Arrange
        var userInfo = new BasicUserInfo {
            Id = Guid.CreateVersion7(),
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
            // Act
            IsAdministrator = true
        };

        // Assert
        userInfo.IsAdministrator.Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var id = Guid.CreateVersion7();
        var userInfo1 = new BasicUserInfo {
            Id = id,
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
            IsAdministrator = false,
        };
        var userInfo2 = new BasicUserInfo {
            Id = id,
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
            IsAdministrator = false,
        };

        // Act & Assert
        userInfo1.Should().Be(userInfo2);
        (userInfo1 == userInfo2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var userInfo1 = new BasicUserInfo {
            Id = Guid.CreateVersion7(),
            DisplayName = "John Doe",
            Email = "john.doe@example.com",
        };
        var userInfo2 = new BasicUserInfo {
            Id = Guid.CreateVersion7(),
            DisplayName = "Jane Doe",
            Email = "jane.doe@example.com",
        };

        // Act & Assert
        userInfo1.Should().NotBe(userInfo2);
        (userInfo1 != userInfo2).Should().BeTrue();
    }
}
