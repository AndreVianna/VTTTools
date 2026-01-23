namespace VttTools.Admin.Resources.Services;

public sealed class ResourceApprovalServiceTests {
    private readonly IMediaServiceClient _mockMediaClient;
    private readonly IAssetsServiceClient _mockAssetsClient;
    private readonly IAiServiceClient _mockAiClient;
    private readonly IOptions<PublicLibraryOptions> _mockOptions;
    private readonly ResourceApprovalService _service;
    private readonly Guid _masterUserId;

    public ResourceApprovalServiceTests() {
        _mockMediaClient = Substitute.For<IMediaServiceClient>();
        _mockAssetsClient = Substitute.For<IAssetsServiceClient>();
        _mockAiClient = Substitute.For<IAiServiceClient>();
        _mockOptions = Substitute.For<IOptions<PublicLibraryOptions>>();
        _masterUserId = Guid.CreateVersion7();

        _mockOptions.Value.Returns(new PublicLibraryOptions {
            MasterUserId = _masterUserId,
        });

        _service = new(
                       _mockMediaClient,
                       _mockAssetsClient,
                       _mockAiClient,
                       _mockOptions);
    }

    #region ApproveAsync Tests - New Asset Creation

    [Fact]
    public async Task ApproveAsync_WithNewPortraitAsset_CreatesAssetWithPortrait() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var data = new ApproveResourceData {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
            Description = "A mighty dragon",
            Tags = ["dragon", "fantasy"],
            AssetId = null,
        };

        _mockAssetsClient.CreateAssetAsync(Arg.Any<CreateAssetRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(assetId));

        // Act
        var result = await _service.ApproveAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().Be(assetId);

        await _mockAssetsClient.Received(1).CreateAssetAsync(
            Arg.Is<CreateAssetRequest>(r =>
                r.OwnerId == _masterUserId &&
                r.Name == "Dragon" &&
                r.Kind == AssetKind.Character &&
                r.Category == "Fantasy" &&
                r.Type == "Dragon" &&
                r.TokenId == null),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveAsync_WithNewTokenAsset_CreatesAssetWithToken() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var assetId = Guid.CreateVersion7();
        var data = new ApproveResourceData {
            ResourceId = resourceId,
            AssetName = "Dragon Token",
            GenerationType = "Token",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
            AssetId = null,
        };

        _mockAssetsClient.CreateAssetAsync(Arg.Any<CreateAssetRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(assetId));

        // Act
        var result = await _service.ApproveAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().Be(assetId);

        await _mockAssetsClient.Received(1).CreateAssetAsync(
            Arg.Is<CreateAssetRequest>(r =>
                r.TokenId == resourceId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveAsync_WhenCreateAssetFails_ReturnsFailure() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var data = new ApproveResourceData {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            AssetId = null,
        };

        _mockAssetsClient.CreateAssetAsync(Arg.Any<CreateAssetRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Create failed").WithNo<Guid>());

        // Act
        var result = await _service.ApproveAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Create failed");
    }

    #endregion

    #region ApproveAsync Tests - Update Existing Asset

    [Fact]
    public async Task ApproveAsync_WithExistingAssetAndPortrait_ReturnsAssetId() {
        // Arrange
        // With asset-centric storage, portraits are stored at derived blob paths,
        // so approving a portrait for an existing asset just returns the asset ID
        var resourceId = Guid.CreateVersion7();
        var existingAssetId = Guid.CreateVersion7();
        var data = new ApproveResourceData {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            AssetId = existingAssetId,
        };

        // Act
        var result = await _service.ApproveAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().Be(existingAssetId);

        // No API calls needed - portrait is already at the derived blob path
        await _mockAssetsClient.DidNotReceive().UpdateAssetAsync(Arg.Any<Guid>(), Arg.Any<UpdateAssetRequest>(), Arg.Any<CancellationToken>());
        await _mockAssetsClient.DidNotReceive().CreateAssetAsync(Arg.Any<CreateAssetRequest>(), Arg.Any<CancellationToken>());
        await _mockAssetsClient.DidNotReceive().AddTokenAsync(Arg.Any<Guid>(), Arg.Any<AddTokenRequest>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveAsync_WithExistingAssetAndToken_AddsToken() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var existingAssetId = Guid.CreateVersion7();
        var data = new ApproveResourceData {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Token",
            Kind = AssetKind.Character,
            AssetId = existingAssetId,
        };

        _mockAssetsClient.AddTokenAsync(existingAssetId, Arg.Any<AddTokenRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await _service.ApproveAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().Be(existingAssetId);

        await _mockAssetsClient.Received(1).AddTokenAsync(
            existingAssetId,
            Arg.Is<AddTokenRequest>(r => r.ResourceId == resourceId),
            Arg.Any<CancellationToken>());

        await _mockAssetsClient.DidNotReceive().CreateAssetAsync(Arg.Any<CreateAssetRequest>(), Arg.Any<CancellationToken>());
        await _mockAssetsClient.DidNotReceive().UpdateAssetAsync(Arg.Any<Guid>(), Arg.Any<UpdateAssetRequest>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ApproveAsync_WhenAddTokenFails_ReturnsFailure() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var existingAssetId = Guid.CreateVersion7();
        var data = new ApproveResourceData {
            ResourceId = resourceId,
            AssetName = "Dragon",
            GenerationType = "Token",
            Kind = AssetKind.Character,
            AssetId = existingAssetId,
        };

        _mockAssetsClient.AddTokenAsync(existingAssetId, Arg.Any<AddTokenRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Add token failed"));

        // Act
        var result = await _service.ApproveAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Add token failed");
    }

    #endregion

    #region RegenerateAsync Tests

    [Fact]
    public async Task RegenerateAsync_WithPortrait_GeneratesAndUploadsNewPortrait() {
        // Arrange
        var oldResourceId = Guid.CreateVersion7();
        var newResourceId = Guid.CreateVersion7();
        var data = new RegenerateResourceData {
            ResourceId = oldResourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
            Description = "A mighty dragon",
        };

        var generatedImage = new byte[] { 1, 2, 3, 4 };

        _mockAiClient.GenerateImageAsync(Arg.Any<ImageGenerationRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(generatedImage));

        _mockMediaClient.UploadResourceAsync(
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<ResourceRole>(),
                Arg.Any<CancellationToken>())
            .Returns(Result.Success(newResourceId));

        _mockMediaClient.DeleteResourceAsync(oldResourceId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await _service.RegenerateAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        result.Value.Should().Be(newResourceId);

        await _mockAiClient.Received(1).GenerateImageAsync(
            Arg.Is<ImageGenerationRequest>(r =>
                r.ContentType == GeneratedContentType.ImagePortrait &&
                r.Prompt.Contains("Dragon")),
            Arg.Any<CancellationToken>());

        await _mockMediaClient.Received(1).UploadResourceAsync(
            generatedImage,
            "Dragon_portrait.png",
            "image/png",
            ResourceRole.Portrait,
            Arg.Any<CancellationToken>());

        await _mockMediaClient.Received(1).DeleteResourceAsync(
            oldResourceId,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateAsync_WithToken_GeneratesAndUploadsNewToken() {
        // Arrange
        var oldResourceId = Guid.CreateVersion7();
        var newResourceId = Guid.CreateVersion7();
        var data = new RegenerateResourceData {
            ResourceId = oldResourceId,
            AssetName = "Dragon",
            GenerationType = "Token",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
        };

        var generatedImage = new byte[] { 1, 2, 3, 4 };

        _mockAiClient.GenerateImageAsync(Arg.Any<ImageGenerationRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(generatedImage));

        _mockMediaClient.UploadResourceAsync(
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<ResourceRole>(),
                Arg.Any<CancellationToken>())
            .Returns(Result.Success(newResourceId));

        _mockMediaClient.DeleteResourceAsync(oldResourceId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await _service.RegenerateAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();

        await _mockAiClient.Received(1).GenerateImageAsync(
            Arg.Is<ImageGenerationRequest>(r => r.ContentType == GeneratedContentType.ImageToken),
            Arg.Any<CancellationToken>());

        await _mockMediaClient.Received(1).UploadResourceAsync(
            generatedImage,
            "Dragon_token.png",
            "image/png",
            ResourceRole.Token,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateAsync_BuildsPromptCorrectly() {
        // Arrange
        var data = new RegenerateResourceData {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Ancient Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
            Category = "Fantasy",
            Type = "Dragon",
            Description = "An ancient and powerful dragon",
        };

        var generatedImage = new byte[] { 1, 2, 3, 4 };

        _mockAiClient.GenerateImageAsync(Arg.Any<ImageGenerationRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(generatedImage));

        _mockMediaClient.UploadResourceAsync(
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<ResourceRole>(),
                Arg.Any<CancellationToken>())
            .Returns(Result.Success(Guid.CreateVersion7()));

        _mockMediaClient.DeleteResourceAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        await _service.RegenerateAsync(data, TestContext.Current.CancellationToken);

        // Assert
        await _mockAiClient.Received(1).GenerateImageAsync(
            Arg.Is<ImageGenerationRequest>(r =>
                r.Prompt.Contains("Ancient Dragon") &&
                r.Prompt.Contains("Fantasy") &&
                r.Prompt.Contains("Dragon") &&
                r.Prompt.Contains("An ancient and powerful dragon")),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateAsync_WhenGenerationFails_ReturnsFailure() {
        // Arrange
        var data = new RegenerateResourceData {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        _mockAiClient.GenerateImageAsync(Arg.Any<ImageGenerationRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Generation failed").WithNo<byte[]>());

        // Act
        var result = await _service.RegenerateAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Generation failed");
        await _mockMediaClient.DidNotReceive().UploadResourceAsync(
            Arg.Any<byte[]>(),
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<ResourceRole>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateAsync_WhenUploadFails_ReturnsFailure() {
        // Arrange
        var data = new RegenerateResourceData {
            ResourceId = Guid.CreateVersion7(),
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        var generatedImage = new byte[] { 1, 2, 3, 4 };

        _mockAiClient.GenerateImageAsync(Arg.Any<ImageGenerationRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(generatedImage));

        _mockMediaClient.UploadResourceAsync(
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<ResourceRole>(),
                Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Upload failed").WithNo<Guid>());

        // Act
        var result = await _service.RegenerateAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Upload failed");
        await _mockMediaClient.DidNotReceive().DeleteResourceAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RegenerateAsync_DeletesOldResourceAfterSuccessfulUpload() {
        // Arrange
        var oldResourceId = Guid.CreateVersion7();
        var newResourceId = Guid.CreateVersion7();
        var data = new RegenerateResourceData {
            ResourceId = oldResourceId,
            AssetName = "Dragon",
            GenerationType = "Portrait",
            Kind = AssetKind.Character,
        };

        var generatedImage = new byte[] { 1, 2, 3, 4 };

        _mockAiClient.GenerateImageAsync(Arg.Any<ImageGenerationRequest>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(generatedImage));

        _mockMediaClient.UploadResourceAsync(
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<ResourceRole>(),
                Arg.Any<CancellationToken>())
            .Returns(Result.Success(newResourceId));

        _mockMediaClient.DeleteResourceAsync(oldResourceId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        await _service.RegenerateAsync(data, TestContext.Current.CancellationToken);

        // Assert
        Received.InOrder(async () => {
            await _mockMediaClient.UploadResourceAsync(
                Arg.Any<byte[]>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<ResourceRole>(),
                Arg.Any<CancellationToken>());
            await _mockMediaClient.DeleteResourceAsync(oldResourceId, Arg.Any<CancellationToken>());
        });
    }

    #endregion

    #region RejectAsync Tests

    [Fact]
    public async Task RejectAsync_WithValidResourceId_DeletesResource() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var data = new RejectResourceData {
            ResourceId = resourceId,
        };

        _mockMediaClient.DeleteResourceAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await _service.RejectAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeTrue();
        await _mockMediaClient.Received(1).DeleteResourceAsync(
            resourceId,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RejectAsync_WhenDeleteFails_ReturnsFailure() {
        // Arrange
        var resourceId = Guid.CreateVersion7();
        var data = new RejectResourceData {
            ResourceId = resourceId,
        };

        _mockMediaClient.DeleteResourceAsync(resourceId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure("Display not found"));

        // Act
        var result = await _service.RejectAsync(data, TestContext.Current.CancellationToken);

        // Assert
        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain("Display not found");
    }

    #endregion
}