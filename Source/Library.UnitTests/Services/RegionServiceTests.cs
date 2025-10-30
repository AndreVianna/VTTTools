using Region = VttTools.Library.Scenes.Model.Region;

namespace VttTools.Library.Services;

public class RegionServiceTests {
    private readonly IRegionStorage _regionStorage;
    private readonly RegionService _service;
    private readonly Guid _userId = Guid.CreateVersion7();
    private readonly CancellationToken _ct;

    public RegionServiceTests() {
        _regionStorage = Substitute.For<IRegionStorage>();
        _service = new(_regionStorage);
#if XUNITV3
        _ct = TestContext.Current.CancellationToken;
#else
        _ct = CancellationToken.None;
#endif
    }

    [Fact]
    public async Task GetRegionsAsync_ReturnsRegionsForOwner() {
        var regions = new List<Region> {
            new() { Id = Guid.CreateVersion7(), Name = "Test Region 1", OwnerId = _userId, RegionType = "Illumination", LabelMap = new Dictionary<int, string> { { 0, "Dark" }, { 1, "Light" } } },
            new() { Id = Guid.CreateVersion7(), Name = "Test Region 2", OwnerId = _userId, RegionType = "Elevation", LabelMap = new Dictionary<int, string> { { 0, "Ground" }, { 1, "High" } } },
        };
        _regionStorage.GetByOwnerAsync(_userId, 1, 20, Arg.Any<CancellationToken>()).Returns(regions);

        var result = await _service.GetRegionsAsync(_userId, 1, 20, _ct);

        result.Should().BeEquivalentTo(regions);
        await _regionStorage.Received(1).GetByOwnerAsync(_userId, 1, 20, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetRegionByIdAsync_ReturnsRegion_WhenOwnerMatches() {
        var regionId = Guid.CreateVersion7();
        var region = new Region { Id = regionId, Name = "Test Region", OwnerId = _userId, RegionType = "Illumination", LabelMap = new Dictionary<int, string> { { 0, "Dark" }, { 1, "Light" } } };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns(region);

        var result = await _service.GetRegionByIdAsync(regionId, _userId, _ct);

        result.Should().NotBeNull();
        result!.Id.Should().Be(regionId);
        result.OwnerId.Should().Be(_userId);
        await _regionStorage.Received(1).GetByIdAsync(regionId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetRegionByIdAsync_ReturnsNull_WhenRegionNotFound() {
        var regionId = Guid.CreateVersion7();
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns((Region?)null);

        var result = await _service.GetRegionByIdAsync(regionId, _userId, _ct);

        result.Should().BeNull();
        await _regionStorage.Received(1).GetByIdAsync(regionId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetRegionByIdAsync_ReturnsNull_WhenOwnerDoesNotMatch() {
        var regionId = Guid.CreateVersion7();
        var differentUserId = Guid.CreateVersion7();
        var region = new Region { Id = regionId, Name = "Test Region", OwnerId = differentUserId, RegionType = "Illumination", LabelMap = new Dictionary<int, string> { { 0, "Dark" } } };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns(region);

        var result = await _service.GetRegionByIdAsync(regionId, _userId, _ct);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateRegionAsync_CreatesNewRegion() {
        var data = new CreateRegionData {
            Name = "New Region",
            Description = "Test region",
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" }, { 1, "Dim" }, { 2, "Bright" } },
        };

        var result = await _service.CreateRegionAsync(data, _userId, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value!.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.RegionType.Should().Be(data.RegionType);
        result.Value.LabelMap.Should().BeEquivalentTo(data.LabelMap);
        result.Value.OwnerId.Should().Be(_userId);
        result.Value.Id.Should().NotBe(Guid.Empty);
        await _regionStorage.Received(1).AddAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateRegionAsync_ReturnsError_WhenNameIsEmpty() {
        var data = new CreateRegionData {
            Name = "",
            Description = "Test",
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };

        var result = await _service.CreateRegionAsync(data, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
        await _regionStorage.DidNotReceive().AddAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateRegionAsync_ReturnsError_WhenNameTooLong() {
        var data = new CreateRegionData {
            Name = new string('a', 129),
            Description = "Test",
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };

        var result = await _service.CreateRegionAsync(data, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("128 characters"));
        await _regionStorage.DidNotReceive().AddAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateRegionAsync_ReturnsError_WhenRegionTypeIsEmpty() {
        var data = new CreateRegionData {
            Name = "Test Region",
            RegionType = "",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };

        var result = await _service.CreateRegionAsync(data, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("Region type is required"));
        await _regionStorage.DidNotReceive().AddAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateRegionAsync_ReturnsError_WhenLabelMapIsEmpty() {
        var data = new CreateRegionData {
            Name = "Test Region",
            RegionType = "Illumination",
            LabelMap = [],
        };

        var result = await _service.CreateRegionAsync(data, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Message.Contains("at least one label entry"));
        await _regionStorage.DidNotReceive().AddAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateRegionAsync_UpdatesRegion() {
        var regionId = Guid.CreateVersion7();
        var existingRegion = new Region {
            Id = regionId,
            Name = "Old Name",
            OwnerId = _userId,
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };
        var data = new UpdateRegionData {
            Name = "Updated Region",
            Description = "Updated description",
            RegionType = "Elevation",
            LabelMap = new Dictionary<int, string> { { 0, "Low" }, { 1, "High" } },
        };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns(existingRegion);

        var result = await _service.UpdateRegionAsync(regionId, data, _userId, _ct);

        result.IsSuccessful.Should().BeTrue();
        result.Value!.Name.Should().Be(data.Name);
        result.Value.Description.Should().Be(data.Description);
        result.Value.RegionType.Should().Be(data.RegionType);
        result.Value.LabelMap.Should().BeEquivalentTo(data.LabelMap);
        await _regionStorage.Received(1).UpdateAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateRegionAsync_ReturnsNotFound_WhenRegionDoesNotExist() {
        var regionId = Guid.CreateVersion7();
        var data = new UpdateRegionData { Name = "Test", RegionType = "Illumination", LabelMap = new Dictionary<int, string> { { 0, "Dark" } } };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns((Region?)null);

        var result = await _service.UpdateRegionAsync(regionId, data, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _regionStorage.DidNotReceive().UpdateAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateRegionAsync_ReturnsNotAllowed_WhenOwnerDoesNotMatch() {
        var regionId = Guid.CreateVersion7();
        var differentUserId = Guid.CreateVersion7();
        var existingRegion = new Region {
            Id = regionId,
            Name = "Test",
            OwnerId = differentUserId,
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };
        var data = new UpdateRegionData { Name = "Updated", RegionType = "Illumination", LabelMap = new Dictionary<int, string> { { 0, "Dark" } } };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns(existingRegion);

        var result = await _service.UpdateRegionAsync(regionId, data, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _regionStorage.DidNotReceive().UpdateAsync(Arg.Any<Region>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteRegionAsync_DeletesRegion() {
        var regionId = Guid.CreateVersion7();
        var region = new Region {
            Id = regionId,
            Name = "Test",
            OwnerId = _userId,
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns(region);

        var result = await _service.DeleteRegionAsync(regionId, _userId, _ct);

        result.IsSuccessful.Should().BeTrue();
        await _regionStorage.Received(1).DeleteAsync(regionId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteRegionAsync_ReturnsNotFound_WhenRegionDoesNotExist() {
        var regionId = Guid.CreateVersion7();
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns((Region?)null);

        var result = await _service.DeleteRegionAsync(regionId, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotFound");
        await _regionStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteRegionAsync_ReturnsNotAllowed_WhenOwnerDoesNotMatch() {
        var regionId = Guid.CreateVersion7();
        var differentUserId = Guid.CreateVersion7();
        var region = new Region {
            Id = regionId,
            Name = "Test",
            OwnerId = differentUserId,
            RegionType = "Illumination",
            LabelMap = new Dictionary<int, string> { { 0, "Dark" } },
        };
        _regionStorage.GetByIdAsync(regionId, Arg.Any<CancellationToken>()).Returns(region);

        var result = await _service.DeleteRegionAsync(regionId, _userId, _ct);

        result.IsSuccessful.Should().BeFalse();
        result.Errors[0].Message.Should().Be("NotAllowed");
        await _regionStorage.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}