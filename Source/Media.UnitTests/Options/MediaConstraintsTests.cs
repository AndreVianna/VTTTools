namespace VttTools.Media.Options;

public class MediaConstraintsTests {
    [Theory]
    [InlineData(ResourceRole.Background, "image/png", true)]
    [InlineData(ResourceRole.Background, "image/jpeg", true)]
    [InlineData(ResourceRole.Background, "video/mp4", true)]
    [InlineData(ResourceRole.Background, "audio/mpeg", false)]
    [InlineData(ResourceRole.Token, "image/png", true)]
    [InlineData(ResourceRole.Token, "video/mp4", false)]
    [InlineData(ResourceRole.SoundEffect, "audio/mpeg", true)]
    [InlineData(ResourceRole.SoundEffect, "image/png", false)]
    [InlineData(ResourceRole.CutScene, "video/mp4", true)]
    [InlineData(ResourceRole.CutScene, "image/png", false)]
    public void IsValidContentType_WithVariousTypes_ReturnsExpected(ResourceRole type, string contentType, bool expected) {
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
    public void For_ContainsAllRoles() {
        MediaConstraints.For.Should().ContainKey(ResourceRole.Background);
        MediaConstraints.For.Should().ContainKey(ResourceRole.Token);
        MediaConstraints.For.Should().ContainKey(ResourceRole.Portrait);
        MediaConstraints.For.Should().ContainKey(ResourceRole.Overlay);
        MediaConstraints.For.Should().ContainKey(ResourceRole.Illustration);
        MediaConstraints.For.Should().ContainKey(ResourceRole.SoundEffect);
        MediaConstraints.For.Should().ContainKey(ResourceRole.AmbientSound);
        MediaConstraints.For.Should().ContainKey(ResourceRole.CutScene);
        MediaConstraints.For.Should().ContainKey(ResourceRole.UserAvatar);
    }

    [Fact]
    public void For_Background_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.Background];

        constraints.MaxWidth.Should().Be(4096);
        constraints.MaxHeight.Should().Be(4096);
        constraints.MaxDuration.Should().Be(TimeSpan.FromMinutes(5));
        constraints.MaxFileSize.Should().Be(50 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("backgrounds");
    }

    [Fact]
    public void For_Token_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.Token];

        constraints.MaxWidth.Should().Be(256);
        constraints.MaxHeight.Should().Be(256);
        constraints.MaxDuration.Should().Be(TimeSpan.Zero);
        constraints.MaxFileSize.Should().Be(500 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("tokens");
    }

    [Fact]
    public void For_Portrait_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.Portrait];

        constraints.MaxWidth.Should().Be(512);
        constraints.MaxHeight.Should().Be(512);
        constraints.MaxDuration.Should().Be(TimeSpan.FromSeconds(5));
        constraints.MaxFileSize.Should().Be(2 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("portraits");
    }

    [Fact]
    public void For_Overlay_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.Overlay];

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
        var constraints = MediaConstraints.For[ResourceRole.Illustration];

        constraints.MaxWidth.Should().Be(1024);
        constraints.MaxHeight.Should().Be(1024);
        constraints.MaxDuration.Should().Be(TimeSpan.Zero);
        constraints.MaxFileSize.Should().Be(5 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("illustrations");
    }

    [Fact]
    public void For_SoundEffect_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.SoundEffect];

        constraints.MaxWidth.Should().Be(0);
        constraints.MaxHeight.Should().Be(0);
        constraints.MaxDuration.Should().Be(TimeSpan.FromSeconds(10));
        constraints.MaxFileSize.Should().Be(1 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeFalse();
        constraints.StorageFolder.Should().Be("sound-effects");
    }

    [Fact]
    public void For_AmbientSound_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.AmbientSound];

        constraints.MaxWidth.Should().Be(0);
        constraints.MaxHeight.Should().Be(0);
        constraints.MaxDuration.Should().Be(TimeSpan.FromMinutes(10));
        constraints.MaxFileSize.Should().Be(15 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeFalse();
        constraints.StorageFolder.Should().Be("ambient-sounds");
    }

    [Fact]
    public void For_CutScene_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.CutScene];

        constraints.MaxWidth.Should().Be(1920);
        constraints.MaxHeight.Should().Be(1080);
        constraints.MaxDuration.Should().Be(TimeSpan.FromMinutes(2));
        constraints.MaxFileSize.Should().Be(100 * 1024 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("cutscenes");
    }

    [Fact]
    public void For_UserAvatar_HasCorrectConstraints() {
        var constraints = MediaConstraints.For[ResourceRole.UserAvatar];

        constraints.MaxWidth.Should().Be(256);
        constraints.MaxHeight.Should().Be(256);
        constraints.MaxDuration.Should().Be(TimeSpan.Zero);
        constraints.MaxFileSize.Should().Be(500 * 1024);
        constraints.GenerateThumbnail.Should().BeTrue();
        constraints.StorageFolder.Should().Be("avatars");
    }

    [Theory]
    [InlineData(ResourceRole.Background)]
    [InlineData(ResourceRole.Token)]
    [InlineData(ResourceRole.Portrait)]
    [InlineData(ResourceRole.Overlay)]
    [InlineData(ResourceRole.Illustration)]
    public void For_ImageTypes_AllowImageContentTypes(ResourceRole type) {
        var constraints = MediaConstraints.For[type];

        constraints.AllowedContentTypes.Should().Contain("image/png");
        constraints.AllowedContentTypes.Should().Contain("image/jpeg");
        constraints.AllowedContentTypes.Should().Contain("image/gif");
        constraints.AllowedContentTypes.Should().Contain("image/webp");
    }

    [Theory]
    [InlineData(ResourceRole.SoundEffect)]
    [InlineData(ResourceRole.AmbientSound)]
    public void For_AudioTypes_AllowAudioContentTypes(ResourceRole type) {
        var constraints = MediaConstraints.For[type];

        constraints.AllowedContentTypes.Should().Contain("audio/mpeg");
        constraints.AllowedContentTypes.Should().Contain("audio/wav");
        constraints.AllowedContentTypes.Should().Contain("audio/ogg");
        constraints.AllowedContentTypes.Should().Contain("audio/webm");
    }

    [Theory]
    [InlineData(ResourceRole.Background)]
    [InlineData(ResourceRole.Portrait)]
    [InlineData(ResourceRole.Overlay)]
    public void For_VideoSupportTypes_AllowVideoContentTypes(ResourceRole type) {
        var constraints = MediaConstraints.For[type];

        constraints.AllowedContentTypes.Should().Contain("video/mp4");
        constraints.AllowedContentTypes.Should().Contain("video/webm");
        constraints.AllowedContentTypes.Should().Contain("video/ogg");
    }

    [Fact]
    public void IsValidContentType_WithCaseInsensitiveMatch_ReturnsTrue() {
        var result = MediaConstraints.IsValidContentType(ResourceRole.Background, "IMAGE/PNG");

        result.Should().BeTrue();
    }

    [Fact]
    public void IsValidContentType_WithInvalidRole_ReturnsFalse() {
        var result = MediaConstraints.IsValidContentType(ResourceRole.Undefined, "image/png");

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
