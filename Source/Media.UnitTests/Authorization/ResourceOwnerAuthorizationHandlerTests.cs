using Microsoft.AspNetCore.Authorization;

namespace VttTools.Media.Authorization;

public class ResourceOwnerAuthorizationHandlerTests {
    private readonly IMediaStorage _mediaStorage;
    private readonly ILogger<ResourceOwnerAuthorizationHandler> _logger;
    private readonly ResourceOwnerAuthorizationHandler _handler;

    public ResourceOwnerAuthorizationHandlerTests() {
        _mediaStorage = Substitute.For<IMediaStorage>();
        _logger = Substitute.For<ILogger<ResourceOwnerAuthorizationHandler>>();
        _handler = new ResourceOwnerAuthorizationHandler(_mediaStorage, _logger);
    }

    [Fact]
    public async Task HandleRequirementAsync_WithOwner_Succeeds() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = resourceId,
            OwnerId = userId,
            Path = "images/test.png",
            ContentType = "image/png",
            FileName = "test.png",
        };

        _mediaStorage.FindByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);

        var user = CreateClaimsPrincipal(userId);
        var context = CreateAuthorizationContext(user, resourceId.ToString());
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task HandleRequirementAsync_WithNonOwner_DoesNotSucceed() {
        // Arrange
        var ownerId = Guid.CreateVersion7();
        var requesterId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = resourceId,
            OwnerId = ownerId,
            Path = "images/test.png",
            ContentType = "image/png",
            FileName = "test.png",
        };

        _mediaStorage.FindByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);

        var user = CreateClaimsPrincipal(requesterId);
        var context = CreateAuthorizationContext(user, resourceId.ToString());
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_WithInvalidResourceId_DoesNotSucceed() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var user = CreateClaimsPrincipal(userId);
        var context = CreateAuthorizationContext(user, "invalid-guid");
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
        await _mediaStorage.DidNotReceive().FindByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleRequirementAsync_WithEmptyResourceId_DoesNotSucceed() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var user = CreateClaimsPrincipal(userId);
        var context = CreateAuthorizationContext(user, Guid.Empty.ToString());
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
        await _mediaStorage.DidNotReceive().FindByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task HandleRequirementAsync_WithResourceNotFound_DoesNotSucceed() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var resourceId = Guid.CreateVersion7();

        _mediaStorage.FindByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns((ResourceMetadata?)null);

        var user = CreateClaimsPrincipal(userId);
        var context = CreateAuthorizationContext(user, resourceId.ToString());
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_WithMissingUserIdClaim_DoesNotSucceed() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = resourceId,
            OwnerId = ownerId,
            Path = "images/test.png",
            ContentType = "image/png",
            FileName = "test.png",
        };

        _mediaStorage.FindByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);

        var user = new ClaimsPrincipal(new ClaimsIdentity([]));
        var context = CreateAuthorizationContext(user, resourceId.ToString());
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_WithInvalidUserIdClaim_DoesNotSucceed() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var ownerId = Guid.CreateVersion7();
        var resource = new ResourceMetadata {
            Id = resourceId,
            OwnerId = ownerId,
            Path = "images/test.png",
            ContentType = "image/png",
            FileName = "test.png",
        };

        _mediaStorage.FindByIdAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(resource);

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "not-a-guid") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        var context = CreateAuthorizationContext(user, resourceId.ToString());
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task HandleRequirementAsync_WithNullResourceId_DoesNotSucceed() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var user = CreateClaimsPrincipal(userId);
        var context = CreateAuthorizationContext(user, null!);
        var requirement = new ResourceOwnerRequirement();

        // Act
        await _handler.HandleAsync(context);

        // Assert
        context.HasSucceeded.Should().BeFalse();
        await _mediaStorage.DidNotReceive().FindByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    private static ClaimsPrincipal CreateClaimsPrincipal(Guid userId) {
        var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    private static AuthorizationHandlerContext CreateAuthorizationContext(ClaimsPrincipal user, string resourceId) {
        var requirement = new ResourceOwnerRequirement();
        var requirements = new[] { requirement };
        return new AuthorizationHandlerContext(requirements, user, resourceId);
    }
}