namespace VttTools.Library.Handlers;

public class ContentHandlersTests {
    private readonly IContentQueryService _contentService = Substitute.For<IContentQueryService>();
    private readonly HttpContext _httpContext = Substitute.For<HttpContext>();
    private readonly ClaimsPrincipal _user = Substitute.For<ClaimsPrincipal>();
    private static readonly Guid _userId = Guid.CreateVersion7();

    public ContentHandlersTests() {
        var claim = new Claim(ClaimTypes.NameIdentifier, _userId.ToString());
        var claims = new List<Claim> { claim };
        _user.Claims.Returns(claims);
        _user.FindFirst(ClaimTypes.NameIdentifier).Returns(claim);
        _httpContext.User.Returns(_user);
    }

    [Fact]
    public async Task GetContentHandler_WithValidRequest_ReturnsOk200() {
        // Arrange
        var response = new PagedContentResponse {
            Data = [
                new ContentListItem {
                    Id = Guid.CreateVersion7(),
                    Type = ContentType.Adventure,
                    Name = "Test Adventure",
                    OwnerId = _userId
                }
            ],
            HasMore = false,
            NextCursor = null
        };

        _contentService.GetContentAsync(
            _userId,
            Arg.Any<ContentFilters>(),
            Arg.Any<CancellationToken>())
            .Returns(response);

        // Act
        var result = await ContentHandlers.GetContentHandler(_httpContext, after: null, limit: 20, contentType: null, style: null, isPublished: null, search: null, owner: null, isOneShot: null, minSceneCount: null, maxSceneCount: null, _contentService, ct: TestContext.Current.CancellationToken);

        // Assert
        var okResult = result.Should().BeOfType<Ok<PagedContentResponse>>().Subject;
        okResult.Value.Should().BeEquivalentTo(response);
    }

    [Fact]
    public async Task GetContentHandler_WithInvalidLimit_ReturnsBadRequest400() {
        // Arrange & Act
        var result = await ContentHandlers.GetContentHandler(_httpContext, after: null, limit: 150, contentType: null, style: null, isPublished: null, search: null, owner: null, isOneShot: null, minSceneCount: null, maxSceneCount: null, _contentService, ct: TestContext.Current.CancellationToken);

        // Assert
        var badRequest = result.Should().BeOfType<BadRequest<string>>().Subject;
        badRequest.Value.Should().Contain("Limit must be between 0 and 100");
    }

    [Fact]
    public async Task GetContentHandler_WithLongSearch_ReturnsBadRequest400() {
        // Arrange
        var longSearch = new string('a', 101);

        // Act
        var result = await ContentHandlers.GetContentHandler(_httpContext, after: null, limit: 20, contentType: null, style: null, isPublished: null, search: longSearch, owner: null, isOneShot: null, minSceneCount: null, maxSceneCount: null, _contentService, ct: TestContext.Current.CancellationToken);

        // Assert
        var badRequest = result.Should().BeOfType<BadRequest<string>>().Subject;
        badRequest.Value.Should().Contain("Search query too long");
    }

    [Fact]
    public async Task GetContentHandler_WithInvalidCursor_ReturnsBadRequest400() {
        // Arrange & Act
        var result = await ContentHandlers.GetContentHandler(_httpContext, after: Guid.Empty, limit: 20, contentType: null, style: null, isPublished: null, search: null, owner: null, isOneShot: null, minSceneCount: null, maxSceneCount: null, _contentService, ct: TestContext.Current.CancellationToken);

        // Assert
        var badRequest = result.Should().BeOfType<BadRequest<string>>().Subject;
        badRequest.Value.Should().Contain("Invalid cursor");
    }
}