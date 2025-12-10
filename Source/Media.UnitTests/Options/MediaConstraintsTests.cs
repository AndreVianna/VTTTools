namespace VttTools.Media.Options;

public class MediaConstraintsTests {
    [Theory]
    [InlineData(ResourceType.Background, "image/png", true)]
    [InlineData(ResourceType.Background, "image/jpeg", true)]
    [InlineData(ResourceType.Background, "video/mp4", true)]
    [InlineData(ResourceType.Background, "audio/mpeg", false)]
    [InlineData(ResourceType.Token, "image/png", true)]
    [InlineData(ResourceType.Token, "video/mp4", false)]
    [InlineData(ResourceType.SoundEffect, "audio/mpeg", true)]
    [InlineData(ResourceType.SoundEffect, "image/png", false)]
    [InlineData(ResourceType.CutScene, "video/mp4", true)]
    [InlineData(ResourceType.CutScene, "image/png", false)]
    public void IsValidContentType_WithVariousTypes_ReturnsExpected(ResourceType type, string contentType, bool expected) {
        var result = MediaConstraints.IsValidContentType(type, contentType);

        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("image/png", "image")]
    [InlineData("image/jpeg", "image")]
    [InlineData("image/gif", "image")]
    [InlineData("image/webp", "image")]
    [InlineData("audio/mpeg", "audio")]
    [InlineData("audio/wav", "audio")]
    [InlineData("audio/ogg", "audio")]
    [InlineData("video/mp4", "video")]
    [InlineData("video/webm", "video")]
    [InlineData("application/pdf", "unknown")]
    [InlineData("text/plain", "unknown")]
    public void GetMediaCategory_WithVariousContentTypes_ReturnsCorrectCategory(string contentType, string expected) {
        var result = MediaConstraints.GetMediaCategory(contentType);

        result.Should().Be(expected);
    }

    [Fact]
    public void For_ContainsAllResourceTypes() {
        MediaConstraints.For.Should().ContainKey(ResourceType.Background);
        MediaConstraints.For.Should().ContainKey(ResourceType.Token);
        MediaConstraints.For.Should().ContainKey(ResourceType.Portrait);
        MediaConstraints.For.Should().ContainKey(ResourceType.Overlay);
        MediaConstraints.For.Should().ContainKey(ResourceType.Illustration);
        MediaConstraints.For.Should().ContainKey(ResourceType.SoundEffect);
        MediaConstraints.For.Should().ContainKey(ResourceType.AmbientSound);
        MediaConstraints.For.Should().ContainKey(ResourceType.CutScene);
        MediaConstraints.For.Should().ContainKey(ResourceType.UserAvatar);
    }

    [Fact]
    public void For_Background_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.Background];

        constraints.MaxWidth.Should().Be(4096);
        constraints.MaxHeight.Should().Be(4096);
        constraints.MaxDuration.Should().Be(TimeSpan.FromMinutes(5));
        constraints.MaxFileSize.Should().Be(50 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("backgrounds");
    }

    [Fact]
    public void For_Token_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.Token];

        constraints.MaxWidth.Should().Be(256);
        constraints.MaxHeight.Should().Be(256);
        constraints.MaxDuration.Should().Be(TimeSpan.Zero);
        constraints.MaxFileSize.Should().Be(500 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("tokens");
    }

    [Fact]
    public void For_Portrait_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.Portrait];

        constraints.MaxWidth.Should().Be(512);
        constraints.MaxHeight.Should().Be(512);
        constraints.MaxDuration.Should().Be(TimeSpan.FromSeconds(5));
        constraints.MaxFileSize.Should().Be(2 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("portraits");
    }

    [Fact]
    public void For_Overlay_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.Overlay];

        constraints.MaxWidth.Should().Be(4096);
        constraints.MaxHeight.Should().Be(4096);
        constraints.MaxDuration.Should().Be(TimeSpan.FromSeconds(30));
        constraints.MaxFileSize.Should().Be(20 * 1024 * 1024);
        constraints.RequiresTransparency.Should().BeTrue();
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("overlays");
    }

    [Fact]
    public void For_Illustration_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.Illustration];

        constraints.MaxWidth.Should().Be(1024);
        constraints.MaxHeight.Should().Be(1024);
        constraints.MaxDuration.Should().Be(TimeSpan.Zero);
        constraints.MaxFileSize.Should().Be(5 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("illustrations");
    }

    [Fact]
    public void For_SoundEffect_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.SoundEffect];

        constraints.MaxWidth.Should().Be(0);
        constraints.MaxHeight.Should().Be(0);
        constraints.MaxDuration.Should().Be(TimeSpan.FromSeconds(10));
        constraints.MaxFileSize.Should().Be(1 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeFalse();
        constraints.StorageFolder.Should().Be("sound-effects");
    }

    [Fact]
    public void For_AmbientSound_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.AmbientSound];

        constraints.MaxWidth.Should().Be(0);
        constraints.MaxHeight.Should().Be(0);
        constraints.MaxDuration.Should().Be(TimeSpan.FromMinutes(10));
        constraints.MaxFileSize.Should().Be(15 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeFalse();
        constraints.StorageFolder.Should().Be("ambient-sounds");
    }

    [Fact]
    public void For_CutScene_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.CutScene];

        constraints.MaxWidth.Should().Be(1920);
        constraints.MaxHeight.Should().Be(1080);
        constraints.MaxDuration.Should().Be(TimeSpan.FromMinutes(2));
        constraints.MaxFileSize.Should().Be(100 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("cutscenes");
    }

    [Fact]
    public void For_UserAvatar_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceType.UserAvatar];

        constraints.MaxWidth.Should().Be(256);
        constraints.MaxHeight.Should().Be(256);
        constraints.MaxDuration.Should().Be(TimeSpan.Zero);
        constraints.MaxFileSize.Should().Be(500 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("avatars");
    }

    [Theory]
    [InlineData(ResourceType.Background)]
    [InlineData(ResourceType.Token)]
    [InlineData(ResourceType.Portrait)]
    [InlineData(ResourceType.Overlay)]
    [InlineData(ResourceType.Illustration)]
    public void For_ImageTypes_AllowImageContentTypes(ResourceType type) {
        var constraints = MediaConstraints.For[type];

        constraints.AllowedContentTypes.Should().Contain("image/png");
        constraints.AllowedContentTypes.Should().Contain("image/jpeg");
        constraints.AllowedContentTypes.Should().Contain("image/gif");
        constraints.AllowedContentTypes.Should().Contain("image/webp");
    }

    [Theory]
    [InlineData(ResourceType.SoundEffect)]
    [InlineData(ResourceType.AmbientSound)]
    public void For_AudioTypes_AllowAudioContentTypes(ResourceType type) {
        var constraints = MediaConstraints.For[type];

        constraints.AllowedContentTypes.Should().Contain("audio/mpeg");
        constraints.AllowedContentTypes.Should().Contain("audio/wav");
        constraints.AllowedContentTypes.Should().Contain("audio/ogg");
        constraints.AllowedContentTypes.Should().Contain("audio/webm");
    }

    [Theory]
    [InlineData(ResourceType.Background)]
    [InlineData(ResourceType.Portrait)]
    [InlineData(ResourceType.Overlay)]
    public void For_VideoSupportTypes_AllowVideoContentTypes(ResourceType type) {
        var constraints = MediaConstraints.For[type];

        constraints.AllowedContentTypes.Should().Contain("video/mp4");
        constraints.AllowedContentTypes.Should().Contain("video/webm");
        constraints.AllowedContentTypes.Should().Contain("video/ogg");
    }

    [Fact]
    public void IsValidContentType_WithCaseInsensitiveMatch_ReturnsTrue() {
        var result = MediaConstraints.IsValidContentType(ResourceType.Background, "IMAGE/PNG");

        result.Should().BeTrue();
    }

    [Fact]
    public void IsValidContentType_WithInvalidResourceType_ReturnsFalse() {
        var result = MediaConstraints.IsValidContentType(ResourceType.Undefined, "image/png");

        result.Should().BeFalse();
    }

    [Fact]
    public void GetMediaCategory_WithCaseInsensitiveMatch_ReturnsCorrectCategory() {
        var result = MediaConstraints.GetMediaCategory("IMAGE/PNG");

        result.Should().Be("image");
    }

    [Fact]
    public void GetMediaCategory_WithMixedCase_ReturnsCorrectCategory() {
        var result = MediaConstraints.GetMediaCategory("AuDiO/MpEg");

        result.Should().Be("audio");
    }
}
