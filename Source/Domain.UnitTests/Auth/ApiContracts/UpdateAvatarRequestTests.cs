namespace VttTools.Auth.ApiContracts;

public class UpdateAvatarRequestTests {
    [Fact]
    public void Constructor_WithAvatarId_InitializesCorrectly() {
        // Arrange
        var avatarId = Guid.CreateVersion7();

        // Act
        var request = new UpdateAvatarRequest(avatarId);

        // Assert
        request.AvatarId.Should().Be(avatarId);
    }

    [Fact]
    public void WithClause_WithChangedValues_UpdatesProperties() {
        // Arrange
        var originalId = Guid.CreateVersion7();
        var newId = Guid.CreateVersion7();
        var original = new UpdateAvatarRequest(originalId);

        // Act
        var updated = original with {
            AvatarId = newId,
        };

        // Assert
        updated.AvatarId.Should().Be(newId);
        original.AvatarId.Should().Be(originalId);
    }

    [Fact]
    public void RecordEquality_WithSameValues_ReturnsTrue() {
        // Arrange
        var avatarId = Guid.CreateVersion7();
        var request1 = new UpdateAvatarRequest(avatarId);
        var request2 = new UpdateAvatarRequest(avatarId);

        // Act & Assert
        request1.Should().Be(request2);
        (request1 == request2).Should().BeTrue();
    }

    [Fact]
    public void RecordEquality_WithDifferentValues_ReturnsFalse() {
        // Arrange
        var avatarId1 = Guid.CreateVersion7();
        var avatarId2 = Guid.CreateVersion7();
        var request1 = new UpdateAvatarRequest(avatarId1);
        var request2 = new UpdateAvatarRequest(avatarId2);

        // Act & Assert
        request1.Should().NotBe(request2);
        (request1 != request2).Should().BeTrue();
    }
}
